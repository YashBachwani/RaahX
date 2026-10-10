export const syntheticStops = [
  { id: 'S01', name: 'Kalupur Railway Station', modes: ['Metro', 'BRTS', 'AMTS'], isInterchange: true },
  { id: 'S02', name: 'Geeta Mandir ST Bus Stand', modes: ['BRTS', 'AMTS'], isInterchange: true },
  { id: 'S03', name: 'Shivranjani Crossroads', modes: ['BRTS', 'AMTS'], isInterchange: true },
  { id: 'S04', name: 'Iscon Crossroads', modes: ['BRTS', 'AMTS'], isInterchange: true },
  { id: 'S05', name: 'Ranip Bus Terminal', modes: ['Metro', 'BRTS', 'AMTS'], isInterchange: true },
  { id: 'S06', name: 'Thaltej', modes: ['Metro', 'AMTS'], isInterchange: false },
  { id: 'S07', name: 'Vastral Gam', modes: ['Metro', 'AMTS'], isInterchange: false },
  { id: 'S08', name: 'Paldi', modes: ['Metro', 'BRTS', 'AMTS'], isInterchange: true },
  { id: 'S09', name: 'Navrangpura', modes: ['Metro', 'AMTS'], isInterchange: false },
  { id: 'S10', name: 'Usmanpura', modes: ['Metro', 'BRTS', 'AMTS'], isInterchange: true },
  { id: 'S11', name: 'Kankaria Lake', modes: ['Metro', 'BRTS', 'AMTS'], isInterchange: true },
  { id: 'S12', name: 'Maninagar Railway Station', modes: ['BRTS', 'AMTS'], isInterchange: true },
  { id: 'S13', name: 'Nehrunagar', modes: ['BRTS', 'AMTS'], isInterchange: true },
  { id: 'S14', name: 'Gujarat University', modes: ['Metro', 'AMTS'], isInterchange: false },
  { id: 'S15', name: 'LD Engineering College', modes: ['BRTS', 'AMTS'], isInterchange: true },
  { id: 'S16', name: 'RTO Circle', modes: ['BRTS', 'AMTS'], isInterchange: true },
  { id: 'S17', name: 'Bapunagar', modes: ['BRTS', 'AMTS'], isInterchange: true },
  { id: 'S18', name: 'Naroda', modes: ['BRTS', 'AMTS'], isInterchange: true },
  { id: 'S19', name: 'Chandkheda', modes: ['BRTS', 'AMTS'], isInterchange: true },
  { id: 'S20', name: 'SG Highway (Zydus)', modes: ['BRTS', 'AMTS'], isInterchange: false },
  { id: 'S21', name: 'Isolated Stop (Unreachable)', modes: ['AMTS'], isInterchange: false }
];

export const syntheticEdges = [
  // Metro East-West Line
  { id: 'E01', from: 'S06', to: 'S14', mode: 'Metro', routeId: 'EW-LINE', duration: 8, fare: 10, isBidirectional: true },
  { id: 'E02', from: 'S14', to: 'S09', mode: 'Metro', routeId: 'EW-LINE', duration: 4, fare: 5, isBidirectional: true },
  { id: 'E03', from: 'S09', to: 'S10', mode: 'Metro', routeId: 'EW-LINE', duration: 3, fare: 5, isBidirectional: true },
  { id: 'E04', from: 'S10', to: 'S01', mode: 'Metro', routeId: 'EW-LINE', duration: 10, fare: 15, isBidirectional: true },
  { id: 'E05', from: 'S01', to: 'S11', mode: 'Metro', routeId: 'EW-LINE', duration: 7, fare: 10, isBidirectional: true },
  { id: 'E06', from: 'S11', to: 'S07', mode: 'Metro', routeId: 'EW-LINE', duration: 15, fare: 20, isBidirectional: true },
  
  // Metro North-South Line
  { id: 'E07', from: 'S05', to: 'S10', mode: 'Metro', routeId: 'NS-LINE', duration: 8, fare: 10, isBidirectional: true },
  { id: 'E08', from: 'S10', to: 'S08', mode: 'Metro', routeId: 'NS-LINE', duration: 6, fare: 10, isBidirectional: true },
  
  // BRTS Corridor 1
  { id: 'E09', from: 'S16', to: 'S05', mode: 'BRTS', routeId: 'BRTS-C1', duration: 5, fare: 4, isBidirectional: true },
  { id: 'E10', from: 'S05', to: 'S10', mode: 'BRTS', routeId: 'BRTS-C1', duration: 10, fare: 8, isBidirectional: true },
  { id: 'E11', from: 'S10', to: 'S08', mode: 'BRTS', routeId: 'BRTS-C1', duration: 8, fare: 6, isBidirectional: true },
  { id: 'E12', from: 'S08', to: 'S02', mode: 'BRTS', routeId: 'BRTS-C1', duration: 12, fare: 10, isBidirectional: true },
  { id: 'E13', from: 'S02', to: 'S01', mode: 'BRTS', routeId: 'BRTS-C1', duration: 8, fare: 6, isBidirectional: true },
  
  // BRTS Corridor 2
  { id: 'E14', from: 'S04', to: 'S03', mode: 'BRTS', routeId: 'BRTS-C2', duration: 6, fare: 5, isBidirectional: true },
  { id: 'E15', from: 'S03', to: 'S13', mode: 'BRTS', routeId: 'BRTS-C2', duration: 5, fare: 4, isBidirectional: true },
  { id: 'E16', from: 'S13', to: 'S15', mode: 'BRTS', routeId: 'BRTS-C2', duration: 4, fare: 4, isBidirectional: true },
  { id: 'E17', from: 'S15', to: 'S08', mode: 'BRTS', routeId: 'BRTS-C2', duration: 6, fare: 5, isBidirectional: true },
  
  // AMTS Routes
  { id: 'E18', from: 'S06', to: 'S04', mode: 'AMTS', routeId: 'AMTS-50', duration: 15, fare: 8, isBidirectional: true },
  { id: 'E19', from: 'S04', to: 'S20', mode: 'AMTS', routeId: 'AMTS-50', duration: 10, fare: null, isBidirectional: true }, // Unknown fare
  { id: 'E20', from: 'S13', to: 'S14', mode: 'AMTS', routeId: 'AMTS-43', duration: 7, fare: 5, isBidirectional: true },
  { id: 'E21', from: 'S14', to: 'S15', mode: 'AMTS', routeId: 'AMTS-43', duration: 3, fare: 3, isBidirectional: true },
  { id: 'E22', from: 'S15', to: 'S16', mode: 'AMTS', routeId: 'AMTS-43', duration: 12, fare: 8, isBidirectional: true },
  { id: 'E23', from: 'S01', to: 'S17', mode: 'AMTS', routeId: 'AMTS-112', duration: 15, fare: 10, isBidirectional: true },
  { id: 'E24', from: 'S17', to: 'S18', mode: 'AMTS', routeId: 'AMTS-112', duration: 12, fare: 8, isBidirectional: true },
  { id: 'E25', from: 'S11', to: 'S12', mode: 'AMTS', routeId: 'AMTS-30', duration: 10, fare: 6, isBidirectional: true },
  { id: 'E26', from: 'S16', to: 'S19', mode: 'AMTS', routeId: 'AMTS-89', duration: 15, fare: 10, isBidirectional: true },

  // Walking Links (Transfers at same stop)
  { id: 'E27', from: 'S01', to: 'S01', mode: 'Walk', routeId: 'Transfer', duration: 5, fare: 0, isBidirectional: true },
  { id: 'E28', from: 'S08', to: 'S08', mode: 'Walk', routeId: 'Transfer', duration: 3, fare: 0, isBidirectional: true },
  { id: 'E29', from: 'S10', to: 'S10', mode: 'Walk', routeId: 'Transfer', duration: 4, fare: 0, isBidirectional: true },
  { id: 'E30', from: 'S05', to: 'S05', mode: 'Walk', routeId: 'Transfer', duration: 6, fare: 0, isBidirectional: true },
  
  // Walking Links (Nearby stops)
  { id: 'E31', from: 'S09', to: 'S15', mode: 'Walk', routeId: 'Walk', duration: 12, fare: 0, isBidirectional: true },
  { id: 'E32', from: 'S14', to: 'S15', mode: 'Walk', routeId: 'Walk', duration: 8, fare: 0, isBidirectional: true },
  { id: 'E33', from: 'S02', to: 'S11', mode: 'Walk', routeId: 'Walk', duration: 15, fare: 0, isBidirectional: true },
];
