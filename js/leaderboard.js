// ============================================================
// Persistent leaderboard via localStorage (top 10).
// ============================================================
const KEY = 'dg-treasure-hunt-leaderboard-v1';

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
  board.sort((a, b) => b.score - a.score || a.timeSec - b.timeSec);
  const top = board.slice(0, 10);
  localStorage.setItem(KEY, JSON.stringify(top));
  return top;
}

export function renderBoard(listEl, highlightName = null) {
  const board = loadBoard();
  listEl.innerHTML = '';
  if (board.length === 0) {
    const li = document.createElement('li');
    li.className = 'lb-empty';
    li.textContent = '— 暫無紀錄 No records yet —';
    listEl.appendChild(li);
    return;
  }
  const medals = ['🥇', '🥈', '🥉'];
  board.forEach((entry, i) => {
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
  return s.replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}
