const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

export function normalizePlayerName(value) {
  return [...String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()].slice(0, 14).join('');
}

export function validateLeaderboardEntry(payload, date = new Date()) {
  const name = normalizePlayerName(payload?.name);
  const score = Number(payload?.score);
  const timeSec = Number(payload?.timeSec);
  const diff = payload?.diff;
  if (!name) return { ok: false, error: 'valid name required' };
  if (!Number.isInteger(score) || score < 0 || score > 100000) {
    return { ok: false, error: 'score outside valid range' };
  }
  if (!Number.isInteger(timeSec) || timeSec < 0 || timeSec > 21600) {
    return { ok: false, error: 'time outside valid range' };
  }
  if (!DIFFICULTIES.has(diff)) return { ok: false, error: 'invalid difficulty' };
  return {
    ok: true,
    entry: { name, score, timeSec, diff, date: date.toISOString().slice(0, 10) },
  };
}
