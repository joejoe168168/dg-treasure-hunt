// ============================================================
// Leaderboard — global (Vercel Blob via /api/leaderboard) with
// localStorage fallback for offline / local play.
// Scores are auto-saved on victory; no button needed.
// ============================================================
const KEY = 'dg-treasure-hunt-leaderboard-v1';
const API = '/api/leaderboard';

// ---------------- local fallback ----------------
export function loadBoard() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveScore(name, score, timeSec) {
  const board = loadBoard();
  board.push({ name, score, timeSec, date: new Date().toISOString().slice(0, 10) });
  // one entry per player — keep the best run
  const best = new Map();
  for (const e of board) {
    const k = String(e.name).toLowerCase();
    const cur = best.get(k);
    if (!cur || e.score > cur.score ||
        (e.score === cur.score && e.timeSec < cur.timeSec)) best.set(k, e);
  }
  const top = [...best.values()]
    .sort((a, b) => b.score - a.score || a.timeSec - b.timeSec)
    .slice(0, 10);
  localStorage.setItem(KEY, JSON.stringify(top));
  return top;
}

// ---------------- global board (Vercel Blob) ----------------
function withTimeout(promise, ms = 6000) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ]);
}

/** Fetch the global board; resolves to an array, or null if unavailable. */
export async function fetchRemoteBoard() {
  try {
    const res = await withTimeout(fetch(API, { cache: 'no-store' }));
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

/** Auto-submit a score to the global board; resolves to the updated board or null. */
export async function submitScore(name, score, timeSec, diff) {
  try {
    const res = await withTimeout(fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score, timeSec, diff }),
    }), 8000);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

// ---------------- rendering ----------------
export function renderBoard(listEl, board, highlightName = null) {
  listEl.innerHTML = '';
  if (!board || board.length === 0) {
    const li = document.createElement('li');
    li.className = 'lb-empty';
    li.textContent = '— 暫無紀錄 No records yet —';
    listEl.appendChild(li);
    return;
  }
  const medals = ['🥇', '🥈', '🥉'];
  board.slice(0, 10).forEach((entry, i) => {
    const li = document.createElement('li');
    const mins = Math.floor(entry.timeSec / 60), secs = entry.timeSec % 60;
    li.innerHTML =
      `<span class="lb-rank">${medals[i] || (i + 1) + '.'}</span>` +
      `<span class="lb-name">${escapeHtml(entry.name)}</span>` +
      `<span class="lb-score">${entry.score} 分 · ${mins}:${String(secs).padStart(2, '0')}</span>`;
    if (highlightName && entry.name === highlightName) {
      li.style.background = 'rgba(255,211,92,.35)';
      li.style.borderRadius = '8px';
    }
    listEl.appendChild(li);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}
