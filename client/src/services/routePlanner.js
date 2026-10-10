import { syntheticStops, syntheticEdges } from '../data/syntheticTransportNetwork';

// Build the adjacency list
const graph = {};
syntheticStops.forEach(stop => {
  graph[stop.id] = [];
});

syntheticEdges.forEach(edge => {
  graph[edge.from].push(edge);
  if (edge.isBidirectional) {
    graph[edge.to].push({
      ...edge,
      from: edge.to,
      to: edge.from
    });
  }
});

/**
 * Scoring profiles
 * Best Overall: 50% time, 25% transfers, 15% walk, 10% fare.
 * We normalize assuming max: 60m time, 3 transfers, 15m walk, 50 INR.
 */
const SCORING_PROFILES = {
  FASTEST: {
    name: 'Fastest',
    weights: { time: 1, transfer: 5, walk: 1.2, fare: 0 },
    description: 'Fastest estimated option. Prioritizes travel time.'
  },
  FEWEST_TRANSFERS: {
    name: 'Fewest Transfers',
    weights: { time: 1, transfer: 1000, walk: 1.5, fare: 0 },
    description: 'Lowest transfer count, minimizing mode changes.'
  },
  BEST_OVERALL: {
    name: 'Best Overall',
    weights: { 
      time: 50 / 60,       // 0.833 per min
      transfer: 25 / 3,    // 8.33 per transfer
      walk: 15 / 15,       // 1.0 per min
      fare: 10 / 50        // 0.2 per INR
    },
    description: 'Recommended because it offers a balanced travel time with optimal transfers and fare.'
  }
};

/**
 * Dijkstra search with state = (stopId, routeId)
 */
function findOptimalRoute(originId, destId, profileName) {
  const profile = SCORING_PROFILES[profileName];
  if (!profile) return null;

  // Priority Queue (min-heap approximation using sorting for simplicity, given small graph)
  // State: { stopId, routeId, score, duration, walkDuration, transfers, fare, path: [], fareUnknown }
  const queue = [{
    stopId: originId,
    routeId: null,
    score: 0,
    duration: 0,
    walkDuration: 0,
    transfers: 0,
    fare: 0,
    fareUnknown: false,
    path: []
  }];

  const visited = new Map(); // key: stopId_routeId

  while (queue.length > 0) {
    // Sort to act as priority queue
    queue.sort((a, b) => a.score - b.score);
    const current = queue.shift();

    if (current.stopId === destId) {
      return {
        ...current,
        profile: profileName,
        profileDetails: profile
      };
    }

    const stateKey = `${current.stopId}_${current.routeId || 'START'}`;
    if (visited.has(stateKey) && visited.get(stateKey) <= current.score) {
      continue;
    }
    visited.set(stateKey, current.score);

    const neighbors = graph[current.stopId] || [];

    for (const edge of neighbors) {
      // Is this a transfer?
      const isFirstLeg = current.routeId === null;
      const isTransfer = !isFirstLeg && current.routeId !== edge.routeId && edge.routeId !== 'Walk' && edge.routeId !== 'Transfer';
      // Walk edges (Transfer/Walk) don't count as transport transfers themselves, but they break the routeId,
      // so the NEXT transport mode will count as a transfer. We handle this by setting routeId to 'Walk'.
      
      const transferCount = isTransfer ? 1 : 0;
      const isWalk = edge.mode === 'Walk';
      const walkTime = isWalk ? edge.duration : 0;
      const edgeFare = edge.fare === null ? 0 : edge.fare;
      const fareUnk = edge.fare === null;

      const deltaScore = 
        (edge.duration * profile.weights.time) +
        (transferCount * profile.weights.transfer) +
        (walkTime * profile.weights.walk) +
        (edgeFare * profile.weights.fare);

      queue.push({
        stopId: edge.to,
        routeId: edge.routeId,
        score: current.score + deltaScore,
        duration: current.duration + edge.duration,
        walkDuration: current.walkDuration + walkTime,
        transfers: current.transfers + transferCount,
        fare: current.fare + edgeFare,
        fareUnknown: current.fareUnknown || fareUnk,
        path: [...current.path, edge]
      });
    }
  }

  return null;
}

export function searchJourneys(originId, destId) {
  if (!originId || !destId || originId === destId) return [];

  const results = [];
  const seenPaths = new Set();

  ['BEST_OVERALL', 'FASTEST', 'FEWEST_TRANSFERS'].forEach(profile => {
    const route = findOptimalRoute(originId, destId, profile);
    if (route) {
      // Create a unique signature for the path to avoid duplicates
      const pathSig = route.path.map(e => e.id).join('-');
      if (!seenPaths.has(pathSig)) {
        seenPaths.add(pathSig);
        
        // Post-process legs to group them by routeId for the UI
        const legs = [];
        let currentLeg = null;
        
        route.path.forEach(edge => {
          if (!currentLeg || currentLeg.routeId !== edge.routeId) {
            if (currentLeg) legs.push(currentLeg);
            currentLeg = {
              mode: edge.mode,
              routeId: edge.routeId,
              fromName: syntheticStops.find(s => s.id === edge.from)?.name || edge.from,
              toName: syntheticStops.find(s => s.id === edge.to)?.name || edge.to,
              duration: edge.duration,
              fare: edge.fare,
              fareUnknown: edge.fare === null
            };
          } else {
            // Extend current leg
            currentLeg.toName = syntheticStops.find(s => s.id === edge.to)?.name || edge.to;
            currentLeg.duration += edge.duration;
            if (edge.fare === null) currentLeg.fareUnknown = true;
            else if (currentLeg.fare !== null) currentLeg.fare += edge.fare;
          }
        });
        if (currentLeg) legs.push(currentLeg);

        // Figure out modes used
        const modesUsed = [...new Set(legs.filter(l => l.mode !== 'Walk').map(l => l.mode))];

        results.push({
          ...route,
          legs,
          modesUsed
        });
      }
    }
  });

  return results;
}
