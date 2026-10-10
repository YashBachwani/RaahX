import networkData from '../src/data/realTransportNetwork.json' with { type: 'json' };
const stops = networkData.stops;

const o = stops.find(s => s.name.toLowerCase() === 'thaltej metro station' || s.id === 'thaltej metro station');
const d = stops.find(s => s.name.toLowerCase() === 'old high court' || s.id === 'old high court');

console.log('Origin matched:', o);
console.log('Dest matched:', d);
