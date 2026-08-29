import assert from 'node:assert/strict';
import { normalizePlayerName, validateLeaderboardEntry } from './js/app/leaderboard-validation.js';

assert.equal(normalizePlayerName('  Hailey   Chan  '), 'Hailey Chan');
assert.equal(normalizePlayerName('<b>Amy</b>'), 'Amy');
assert.equal([...normalizePlayerName('12345678901234567890')].length, 14);
const valid = validateLeaderboardEntry({ name: '學生 A', score: 1234, timeSec: 600, diff: 'medium' }, new Date('2026-07-13T00:00:00Z'));
assert.equal(valid.ok, true);
assert.equal(valid.entry.date, '2026-07-13');
for (const payload of [
  { name: '', score: 0, timeSec: 1, diff: 'easy' },
  { name: 'A', score: Infinity, timeSec: 1, diff: 'easy' },
  { name: 'A', score: 100001, timeSec: 1, diff: 'easy' },
  { name: 'A', score: 1, timeSec: 21601, diff: 'easy' },
  { name: 'A', score: 1, timeSec: 1, diff: 'expert' },
]) assert.equal(validateLeaderboardEntry(payload).ok, false);
console.log('Leaderboard validation tests passed.');
