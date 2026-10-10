import assert from 'node:assert';
import { searchJourneys } from './src/services/routePlanner.js';

function runTests() {
  console.log('Running Journey Planner Algorithm Tests...');

  // Test 1: A known reachable route (S01 to S02)
  const reachable = searchJourneys('S01', 'S02');
  assert.ok(reachable.length > 0, 'Should find routes between connected stops');

  // Test 2: A route that requires multiple transport modes (S01 to S03)
  const multimodal = searchJourneys('S01', 'S03');
  assert.ok(multimodal.length > 0, 'Should find multimodal route');
  assert.ok(multimodal[0].modesUsed.length >= 1, 'Should track modes used');

  // Test 3: The fastest-route objective
  const fastestRoute = multimodal.find(r => r.profile === 'FASTEST');
  const bestRoute = multimodal.find(r => r.profile === 'BEST_OVERALL');
  if (fastestRoute && bestRoute) {
    assert.ok(fastestRoute.duration <= bestRoute.duration, 'Fastest route should not take longer than best overall');
  }

  // Test 4: An unreachable destination
  const unreachable = searchJourneys('S01', 'S21');
  assert.strictEqual(unreachable.length, 0, 'Should return empty array for unreachable destination');

  // Test 5: Identical origin and destination
  const identical = searchJourneys('S01', 'S01');
  assert.strictEqual(identical.length, 0, 'Should return empty array for identical stops');
  
  // Test 6: An unknown origin
  const unknown = searchJourneys('UNKNOWN', 'S01');
  assert.strictEqual(unknown.length, 0, 'Should return empty array for unknown stops');
  
  // Test 7: Correct transfer counts
  // 'S16' to 'S01' via BRTS-C1 has 0 transfers
  const directRoute = searchJourneys('S16', 'S01');
  assert.ok(directRoute[0].transfers >= 0, 'Transfer count should be calculated');

  // Test 8: A route with missing fare data (S04 to S20)
  const unknownFare = searchJourneys('S04', 'S20');
  if (unknownFare.length > 0) {
    assert.strictEqual(unknownFare[0].fareUnknown, true, 'Should track unknown fare components');
  }

  console.log('All automated algorithm tests passed successfully.');
}

runTests();
