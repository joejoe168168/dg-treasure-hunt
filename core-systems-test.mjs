import assert from 'node:assert/strict';
import { createGameState } from './js/app/game-state.js';
import { scoreCorrectAnswer, scoreMissedAnswer, perfectChestBonus } from './js/systems/scoring.js';
import { completeChest, missionStatus } from './js/systems/mission-system.js';
import { configureSession, pauseSessionClock, resumeSessionClock, sessionHasExpired, sessionSecondsRemaining, startSessionClock } from './js/app/session-modes.js';
import { SpatialHash } from './js/systems/spatial-hash.js';

const state = createGameState();
assert.equal(state.phase, 'start');
assert.deepEqual(scoreCorrectAnswer({ timeLeft: 10, multiplier: 1, previousStreak: 0 }),
  { points: 150, streak: 1, streakBonus: 0 });
assert.deepEqual(scoreCorrectAnswer({ timeLeft: 0, multiplier: 2, previousStreak: 2 }),
  { points: 260, streak: 3, streakBonus: 60 });
assert.equal(perfectChestBonus(1.5), 225);
assert.deepEqual(scoreMissedAnswer('incorrect'), { points: 0, streak: 0, reason: 'incorrect' });
assert.deepEqual(scoreMissedAnswer('timeout'), { points: 0, streak: 0, reason: 'timeout' });
for (let i = 0; i < 15; i++) assert.equal(completeChest(state, 16).complete, false);
assert.deepEqual(missionStatus(state, 16), { complete: false, remaining: 1 });
assert.equal(completeChest(state, 16).complete, true);
assert.equal(completeChest(state, 16).remaining, 0);
const mockChests = Array.from({ length: 16 }, () => ({ visible: true, userData: {} }));
const quickState = createGameState();
configureSession(quickState, mockChests, 'quick');
startSessionClock(quickState, 1000);
assert.equal(quickState.chestGoal, 3);
assert.equal(quickState.sessionDeadline, 601000);
assert.equal(sessionSecondsRemaining(quickState, 2000), 599);
assert.equal(sessionHasExpired(quickState, 600999), false);
assert.equal(sessionHasExpired(quickState, 601000), true);
pauseSessionClock(quickState, 101000);
resumeSessionClock(quickState, 131000);
assert.equal(quickState.sessionDeadline, 631000, 'pausing should extend the session deadline');
const spatial = new SpatialHash(10).rebuild([
  { id: 'near', minX: 2, maxX: 4, minZ: 2, maxZ: 4 },
  { id: 'far', minX: 40, maxX: 45, minZ: 40, maxZ: 45 },
]);
assert.deepEqual([...spatial.queryPoint(3, 3)].map(item => item.id), ['near']);
assert.equal(spatial.queryPoint(20, 20).size, 0);
console.log('Core state, scoring and mission tests passed.');
