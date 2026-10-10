import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const networkPath = path.join(__dirname, '../client/src/data/realTransportNetwork.json');
const data = JSON.parse(fs.readFileSync(networkPath, 'utf-8'));
const stops = data.stops;
const edges = data.edges;

console.log('--- RAAHX TRANSPORT NETWORK DIAGNOSTICS ---');

// 1. Number of nodes per transport mode
const nodesByMode = {};
stops.forEach(s => {
  nodesByMode[s.agency] = (nodesByMode[s.agency] || 0) + 1;
});
console.log('\nNodes per transport mode:');
console.table(nodesByMode);

// 2. Number of edges per transport mode
const edgesByMode = {};
edges.forEach(e => {
  edgesByMode[e.mode] = (edgesByMode[e.mode] || 0) + 1;
});
console.log('\nEdges per transport mode:');
console.table(edgesByMode);

// 3. Missing station references
let missingRefs = 0;
const stopIds = new Set(stops.map(s => s.id));
edges.forEach(e => {
  if (!stopIds.has(e.from)) {
    console.log(`Missing from: ${e.from}`);
    missingRefs++;
  }
  if (!stopIds.has(e.to)) {
    console.log(`Missing to: ${e.to}`);
    missingRefs++;
  }
});
console.log(`\nMissing station references: ${missingRefs}`);

// 4. Invalid travel durations
let invalidDurations = 0;
edges.forEach(e => {
  if (e.duration === undefined || e.duration === null || isNaN(e.duration) || e.duration < 0) {
    invalidDurations++;
  }
});
console.log(`Invalid travel durations: ${invalidDurations}`);

// 5. Disconnected graph components (rough check)
// Since this is a large graph, we'll do a simple BFS from Thaltej to see how many nodes are reachable
const adjList = {};
stopIds.forEach(id => adjList[id] = []);
edges.forEach(e => {
  adjList[e.from].push(e.to);
  if (e.mode === 'Walk') adjList[e.to].push(e.from); // walk is bidirectional
});

const visited = new Set();
const queue = ['METRO_THALTEJ'];
visited.add('METRO_THALTEJ');
let head = 0;

while (head < queue.length) {
  const current = queue[head++];
  for (const neighbor of adjList[current]) {
    if (!visited.has(neighbor)) {
      visited.add(neighbor);
      queue.push(neighbor);
    }
  }
}

const unreached = stops.length - visited.size;
console.log(`\nConnected component from METRO_THALTEJ covers ${visited.size}/${stops.length} nodes.`);
console.log(`Disconnected or unreachable nodes: ${unreached}`);

// 6. Test specific query: Thaltej Metro Station -> Old High Court
const resolveStop = (input) => {
  const searchStr = input.trim().toLowerCase();
  const matches = stops.filter(s => 
    s.id === input.trim() || 
    s.name.toLowerCase() === searchStr || 
    (s.aliases && s.aliases.some(a => a.toLowerCase() === searchStr))
  );
  if (matches.length === 0) return null;
  const metroMatch = matches.find(s => s.agency === 'METRO');
  return metroMatch || matches[0];
};

const o = resolveStop('Thaltej Metro Station');
const d = resolveStop('Old High Court');

console.log('\n--- TEST QUERY ---');
console.log(`Origin: 'Thaltej Metro Station' -> Resolves to ID: ${o ? o.id : 'NOT FOUND'}`);
console.log(`Destination: 'Old High Court' -> Resolves to ID: ${d ? d.id : 'NOT FOUND'}`);

if (o && d) {
  console.log(`Can Origin reach Destination? ${visited.has(d.id) ? 'YES' : 'NO'}`);
}
