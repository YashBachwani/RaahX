const fs = require('fs');
const path = require('path');
const readline = require('readline');

// We'll write a simple CSV parser for the specific GTFS files.
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i+1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function readCSV(filePath) {
  const data = [];
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  
  let headers = null;
  for await (const line of rl) {
    if (!line.trim()) continue;
    const parts = parseCSVLine(line);
    if (!headers) {
      headers = parts.map(h => h.trim().replace(/^\uFEFF/, '')); // strip BOM
    } else {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = parts[i] ? parts[i].trim() : '';
      });
      data.push(obj);
    }
  }
  return data;
}

async function processGTFS() {
  console.log('Starting GTFS processing...');
  const gtfsDir = path.join(__dirname, 'amd-gtfs', 'gtfs_extracted');
  
  console.log('Reading agencies...');
  const agencies = await readCSV(path.join(gtfsDir, 'agency.txt'));
  
  console.log('Reading routes...');
  const routes = await readCSV(path.join(gtfsDir, 'routes.txt'));
  
  console.log('Reading stops...');
  const stops = await readCSV(path.join(gtfsDir, 'stops.txt'));
  
  console.log('Reading trips...');
  const trips = await readCSV(path.join(gtfsDir, 'trips.txt'));
  
  console.log('Reading stop_times... this may take a moment.');
  
  // We won't load all stop_times into memory at once if it's too big, 
  // but let's try reading it and building the edges.
  // Actually, 28MB is fine for Node.js memory.
  const stopTimesData = await readCSV(path.join(gtfsDir, 'stop_times.txt'));
  
  console.log(`Loaded ${stops.length} stops, ${routes.length} routes, ${trips.length} trips, and ${stopTimesData.length} stop_times.`);
  
  // Create a map of route ID to agency
  const routeAgencyMap = {};
  routes.forEach(r => {
    routeAgencyMap[r.route_id] = r.agency_id;
  });
  
  // Filter AMTS and AJL (BRTS) and GTSL (Gandhinagar buses if any)
  const tripRouteMap = {};
  trips.forEach(t => {
    tripRouteMap[t.trip_id] = { routeId: t.route_id, directionId: t.direction_id };
  });

  const normalizedStops = [];
  stops.forEach(s => {
    normalizedStops.push({
      id: s.stop_id,
      name: s.stop_name,
      lat: parseFloat(s.stop_lat),
      lon: parseFloat(s.stop_lon),
      agency: 'MULTIPLE' // Will be refined
    });
  });

  // Extract unique edges from stop_times
  // We sort stopTimes by trip_id, then stop_sequence
  console.log('Sorting stop times...');
  stopTimesData.sort((a, b) => {
    if (a.trip_id !== b.trip_id) return a.trip_id.localeCompare(b.trip_id);
    return parseInt(a.stop_sequence) - parseInt(b.stop_sequence);
  });

  console.log('Building edges...');
  const edges = new Map();
  
  for (let i = 0; i < stopTimesData.length - 1; i++) {
    const curr = stopTimesData[i];
    const next = stopTimesData[i+1];
    
    if (curr.trip_id === next.trip_id) {
      const tripInfo = tripRouteMap[curr.trip_id];
      if (!tripInfo) continue;
      
      const routeId = tripInfo.routeId;
      const agency = routeAgencyMap[routeId];
      
      // Calculate duration roughly
      // Format: HH:MM:SS
      const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]); // in minutes
      };
      
      let duration = parseTime(next.arrival_time) - parseTime(curr.departure_time);
      if (duration < 1 || duration > 120 || isNaN(duration)) {
        duration = 3; // Default fallback estimate
      }
      
      const edgeId = `${curr.stop_id}->${next.stop_id}_${routeId}`;
      if (!edges.has(edgeId)) {
        edges.set(edgeId, {
          from: curr.stop_id,
          to: next.stop_id,
          mode: agency === 'AJL' ? 'BRTS' : agency === 'AMTS' ? 'AMTS' : 'BUS',
          routeId: routeId,
          duration: duration,
          fare: null // Fares are complex, we'll leave as null
        });
      }
    }
  }

  // Include Metro Hardcoded Data
  const metroStops = [
    { id: 'METRO_VASTRAL_GAM', name: 'Vastral Gam', aliases: ['Vastral Gam Metro Station'], lat: 23.0039, lon: 72.6644 },
    { id: 'METRO_NIRANT_CROSS_ROAD', name: 'Nirant Cross Road', aliases: ['Nirant Cross Road Metro Station'], lat: 23.0069, lon: 72.6548 },
    { id: 'METRO_VASTRAL', name: 'Vastral', aliases: ['Vastral Metro Station'], lat: 23.0094, lon: 72.6453 },
    { id: 'METRO_RABARI_COLONY', name: 'Rabari Colony', aliases: ['Rabari Colony Metro Station'], lat: 23.0134, lon: 72.6335 },
    { id: 'METRO_AMRAIWADI', name: 'Amraiwadi', aliases: ['Amraiwadi Metro Station'], lat: 23.0152, lon: 72.6247 },
    { id: 'METRO_APPAREL_PARK', name: 'Apparel Park', aliases: ['Apparel Park Metro Station'], lat: 23.0189, lon: 72.6120 },
    { id: 'METRO_KANKARIA_EAST', name: 'Kankaria East', aliases: ['Kankaria East Metro Station'], lat: 23.0232, lon: 72.6033 },
    { id: 'METRO_KALUPUR_RAILWAY_STATION', name: 'Kalupur Railway Station', aliases: ['Kalupur Railway Station Metro Station', 'Kalupur Metro Station', 'Kalupur'], lat: 23.0289, lon: 72.6006 },
    { id: 'METRO_GHEEKANTA', name: 'Gheekanta', aliases: ['Gheekanta Metro Station'], lat: 23.0298, lon: 72.5857 },
    { id: 'METRO_SHAHAPUR', name: 'Shahpur', aliases: ['Shahpur Metro Station'], lat: 23.0315, lon: 72.5768 },
    { id: 'METRO_OLD_HIGH_COURT', name: 'Old High Court', aliases: ['Old High Court Metro Station'], lat: 23.0345, lon: 72.5694 }, // INTERCHANGE
    { id: 'METRO_SP_STADIUM', name: 'SP Stadium', aliases: ['S.P. Stadium', 'SP Stadium Metro Station', 'S.P. Stadium Metro Station'], lat: 23.0423, lon: 72.5647 },
    { id: 'METRO_COMMERCE_SIX_ROAD', name: 'Commerce Six Road', aliases: ['Commerce Six Road Metro Station'], lat: 23.0402, lon: 72.5532 },
    { id: 'METRO_GUJARAT_UNIVERSITY', name: 'Gujarat University', aliases: ['Gujarat University Metro Station'], lat: 23.0381, lon: 72.5417 },
    { id: 'METRO_GURUKUL_ROAD', name: 'Gurukul Road', aliases: ['Gurukul Road Metro Station'], lat: 23.0415, lon: 72.5312 },
    { id: 'METRO_DOORDARSHAN_KENDRA', name: 'Doordarshan Kendra', aliases: ['Doordarshan Kendra Metro Station'], lat: 23.0458, lon: 72.5204 },
    { id: 'METRO_THALTEJ', name: 'Thaltej', aliases: ['Thaltej Metro Station'], lat: 23.0501, lon: 72.5097 },
    { id: 'METRO_THALTEJ_GAM', name: 'Thaltej Gam', aliases: ['Thaltej Gam Metro Station'], lat: 23.0520, lon: 72.4988 },
    // N-S Line
    { id: 'METRO_APMC', name: 'APMC', lat: 22.9972, lon: 72.5358 },
    { id: 'METRO_JIVRAJ_PARK', name: 'Jivraj Park', lat: 23.0035, lon: 72.5379 },
    { id: 'METRO_RAJIV_NAGAR', name: 'Rajiv Nagar', lat: 23.0118, lon: 72.5412 },
    { id: 'METRO_SHREYAS', name: 'Shreyas', lat: 23.0195, lon: 72.5458 },
    { id: 'METRO_PALDI', name: 'Paldi', lat: 23.0234, lon: 72.5583 },
    { id: 'METRO_GANDHIGRAM', name: 'Gandhigram', lat: 23.0289, lon: 72.5623 },
    // Phase 2 - Gandhinagar
    { id: 'METRO_MOTERA_STADIUM', name: 'Motera Stadium', lat: 23.0978, lon: 72.5935 },
    { id: 'METRO_KOTESHWAR_ROAD', name: 'Koteshwar Road', lat: 23.1105, lon: 72.5991 },
    { id: 'METRO_VISHWAKARMA_COLLEGE', name: 'Vishwakarma College', lat: 23.1189, lon: 72.6023 },
    { id: 'METRO_TAPOVAN_CIRCLE', name: 'Tapovan Circle', lat: 23.1256, lon: 72.6056 },
    { id: 'METRO_NARMADA_CANAL', name: 'Narmada Canal', lat: 23.1367, lon: 72.6098 },
    { id: 'METRO_KOBA_CIRCLE', name: 'Koba Circle', lat: 23.1502, lon: 72.6154 },
    { id: 'METRO_GNLU', name: 'GNLU', lat: 23.1654, lon: 72.6221 },
    { id: 'METRO_PDEU', name: 'PDEU', lat: 23.1789, lon: 72.6289 },
    { id: 'METRO_GIFT_CITY', name: 'GIFT City', lat: 23.1901, lon: 72.6355 }, // Branch
    { id: 'METRO_SECTOR_1', name: 'Sector 1', lat: 23.1856, lon: 72.6111 },
    { id: 'METRO_INFO_CITY', name: 'Infocity', lat: 23.1923, lon: 72.6087 },
    { id: 'METRO_SECTOR_10', name: 'Sector 10', lat: 23.2011, lon: 72.6155 }
  ];
  
  // Simplistic metro edges based on array index (assuming linear for demo)
  for (let i = 0; i < 17; i++) {
    edges.set(`METRO_EW_${i}`, { from: metroStops[i].id, to: metroStops[i+1].id, mode: 'Metro', routeId: 'METRO-EW', duration: 2, fare: 5 });
    edges.set(`METRO_EW_${i}_rev`, { from: metroStops[i+1].id, to: metroStops[i].id, mode: 'Metro', routeId: 'METRO-EW', duration: 2, fare: 5 });
  }

  // Combine stops
  metroStops.forEach(m => {
    normalizedStops.push({ ...m, agency: 'METRO' });
  });

  // Calculate Walking Transfers (haversine)
  function distance(lat1, lon1, lat2, lon2) {
    const p = 0.017453292519943295;
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
    return 12742 * Math.asin(Math.sqrt(a)) * 1000; // in meters
  }

  console.log('Calculating walking connections...');
  const MAX_WALKING_DISTANCE_METERS = 500;
  let walkEdgesCount = 0;

  for (let i = 0; i < normalizedStops.length; i++) {
    for (let j = i + 1; j < normalizedStops.length; j++) {
      const stopA = normalizedStops[i];
      const stopB = normalizedStops[j];
      
      // Calculate distance
      const dist = distance(stopA.lat, stopA.lon, stopB.lat, stopB.lon);
      
      if (dist <= MAX_WALKING_DISTANCE_METERS) {
        // Create bidirectional walking edges
        const durationWalk = Math.ceil((dist / 1000) / 5 * 60); // Assuming 5km/h walking speed
        
        const edgeIdAB = `WALK_${stopA.id}_${stopB.id}`;
        edges.set(edgeIdAB, {
          from: stopA.id,
          to: stopB.id,
          mode: 'Walk',
          routeId: 'Walk',
          duration: durationWalk === 0 ? 1 : durationWalk,
          fare: 0
        });

        const edgeIdBA = `WALK_${stopB.id}_${stopA.id}`;
        edges.set(edgeIdBA, {
          from: stopB.id,
          to: stopA.id,
          mode: 'Walk',
          routeId: 'Walk',
          duration: durationWalk === 0 ? 1 : durationWalk,
          fare: 0
        });
        
        walkEdgesCount += 2;
      }
    }
  }
  
  console.log(`Generated ${walkEdgesCount} walking connections.`);
  const edgeList = Array.from(edges.values());
  
  // Output JSON
  const output = {
    stops: normalizedStops,
    edges: edgeList
  };
  
  fs.writeFileSync(path.join(__dirname, '..', 'client', 'src', 'data', 'realTransportNetwork.json'), JSON.stringify(output));
  console.log('Done! Wrote network to JSON.');
}

processGTFS().catch(console.error);
