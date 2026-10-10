import { searchJourneys } from './src/services/routePlanner.js';
console.log(JSON.stringify(searchJourneys('S01', 'S03'), null, 2));
