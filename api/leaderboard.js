// ============================================================
// Vercel serverless function — global leaderboard stored in
// Vercel Blob (store: dg-treasure-hunt-blob).
// Uses the BLOB_READ_WRITE_TOKEN env var injected by Vercel.
//   GET  /api/leaderboard      -> top scores (JSON array)
//   POST /api/leaderboard      -> { name, score, timeSec, diff }
// ============================================================
import { put, list } from '@vercel/blob';

const PATHNAME = 'leaderboard.json';
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const MAX_ENTRIES = 50;

async function readBoard() {
  const { blobs } = await list({ prefix: PATHNAME, limit: 1, token: TOKEN });
  if (!blobs.length) return [];
  // cache-bust: blob URLs are CDN-cached
  const res = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) return [];
  try {
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeBoard(board) {
  await put(PATHNAME, JSON.stringify(board), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
    token: TOKEN,
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!TOKEN) {
    return res.status(503).json({ error: 'Blob store not connected' });
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json(await readBoard());
    }

    if (req.method === 'POST') {
      const { name, score, timeSec, diff } = req.body || {};
      const entry = {
        name: String(name || '').trim().slice(0, 30),
        score: Math.max(0, Math.min(999999, Math.round(Number(score) || 0))),
        timeSec: Math.max(0, Math.round(Number(timeSec) || 0)),
        diff: ['easy', 'medium', 'hard'].includes(diff) ? diff : 'easy',
        date: new Date().toISOString().slice(0, 10),
      };
      if (!entry.name) return res.status(400).json({ error: 'name required' });

      const board = await readBoard();
      board.push(entry);
      // keep only each player's best run, so progress auto-saves
      // mid-game never flood the board with duplicates
      const best = new Map();
      for (const e of board) {
        const k = e.name.toLowerCase();
        const cur = best.get(k);
        if (!cur || e.score > cur.score ||
            (e.score === cur.score && e.timeSec < cur.timeSec)) best.set(k, e);
      }
      const top = [...best.values()]
        .sort((a, b) => b.score - a.score || a.timeSec - b.timeSec)
        .slice(0, MAX_ENTRIES);
      await writeBoard(top);
      return res.status(200).json(top);
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
