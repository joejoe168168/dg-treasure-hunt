// ============================================================
// Vercel serverless function — global leaderboard stored in
// Vercel Blob (store: dg-treasure-hunt-blob).
// Uses the BLOB_READ_WRITE_TOKEN env var injected by Vercel.
//   GET  /api/leaderboard      -> top scores (JSON array)
//   POST /api/leaderboard      -> { name, score, timeSec, diff }
// ============================================================
import { put, list } from '@vercel/blob';
import { validateLeaderboardEntry } from '../js/app/leaderboard-validation.js';

const PATHNAME = 'leaderboard.json';
// accept any of the prefixes Vercel may have used when connecting the store
const TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN ||
  process.env.BLOB2_READ_WRITE_TOKEN ||
  Object.entries(process.env).find(([k]) => k.endsWith('_READ_WRITE_TOKEN'))?.[1];
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
      const validation = validateLeaderboardEntry(req.body);
      if (!validation.ok) return res.status(400).json({ error: validation.error });
      const entry = validation.entry;

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
