// ============================================================
// Question engine — banks live in js/questions/{easy,medium,hard}.js
// (600 hand-written questions, 200 per tier, 50 per category),
// plus an endless difficulty-aware procedural math generator.
//   easy   = P1–P2  (15s per question, ×1 score)
//   medium = P3–P4  (12s per question, ×1.5 score)
//   hard   = P5–P6  (10s per question, ×2 score)
// Each question: { cat, q, a: [4 choices], c: correct index }
// ============================================================
import { EASY } from './questions/easy.js';
import { MEDIUM } from './questions/medium.js';
import { HARD } from './questions/hard.js';

export const CATEGORIES = {
  math:    { label: '數學 Math',      cls: 'cat-math' },
  english: { label: 'English',        cls: 'cat-english' },
  chinese: { label: '中文 Chinese',   cls: 'cat-chinese' },
  general: { label: '常識 General',   cls: 'cat-general' },
};

export const DIFFICULTIES = {
  easy:   { label: '初級 Easy',   sub: 'P1–P2', time: 15, mult: 1,   emoji: '🟢' },
  medium: { label: '中級 Medium', sub: 'P3–P4', time: 12, mult: 1.5, emoji: '🟡' },
  hard:   { label: '高級 Hard',   sub: 'P5–P6', time: 10, mult: 2,   emoji: '🔴' },
};

export const BANK = { easy: EASY, medium: MEDIUM, hard: HARD };

// ------------------------------------------------------------
// Procedural math — endless variety, difficulty-aware
// ------------------------------------------------------------
function randInt(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

function buildChoices(ans, spread) {
  const opts = new Set([ans]);
  while (opts.size < 4) {
    const delta = randInt(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    if (ans + delta >= 0 && ans + delta !== ans) opts.add(ans + delta);
  }
  const a = shuffle([...opts]);
  return { a: a.map(String), c: a.indexOf(ans) };
}

function makeMathQuestion(diff) {
  let q, ans, spread;
  if (diff === 'easy') {
    // P1–P2: 2-digit add/subtract with carrying, ×2/×5/×10, missing number
    const kind = randInt(0, 3);
    if (kind === 0) { const a = randInt(15, 58), b = randInt(13, 39); q = `${a} + ${b} = ?`; ans = a + b; }
    else if (kind === 1) { const a = randInt(40, 99), b = randInt(12, a - 10); q = `${a} − ${b} = ?`; ans = a - b; }
    else if (kind === 2) { const m = [2, 5, 10][randInt(0, 2)], b = randInt(2, 9); q = `${m} × ${b} = ?`; ans = m * b; }
    else { const a = randInt(3, 9), s = randInt(a + 2, 20); q = `□ + ${a} = ${s}，□ 是多少？`; ans = s - a; }
    spread = 4;
  } else if (diff === 'medium') {
    // P3–P4: 3-digit ops, full times tables, division, fraction of n
    const kind = randInt(0, 4);
    if (kind === 0) { const a = randInt(125, 689), b = randInt(110, 290); q = `${a} + ${b} = ?`; ans = a + b; spread = 20; }
    else if (kind === 1) { const a = randInt(300, 900), b = randInt(110, 290); q = `${a} − ${b} = ?`; ans = a - b; spread = 20; }
    else if (kind === 2) { const a = randInt(3, 12), b = randInt(3, 12); q = `${a} × ${b} = ?`; ans = a * b; spread = 8; }
    else if (kind === 3) { const b = randInt(3, 12), r = randInt(4, 12); q = `${b * r} ÷ ${b} = ?`; ans = r; spread = 4; }
    else { const d = [2, 3, 4, 5][randInt(0, 3)], r = randInt(3, 12); q = `${d * r} 的 1/${d} 是多少？`; ans = r; spread = 4; }
  } else {
    // P5–P6: order of ops, 2-digit ×, %, decimals, simple equations
    const kind = randInt(0, 4);
    if (kind === 0) { const a = randInt(3, 9), b = randInt(3, 9), cc = randInt(2, 9); q = `(${a} + ${b}) × ${cc} = ?`; ans = (a + b) * cc; spread = 12; }
    else if (kind === 1) { const a = randInt(13, 38), b = randInt(12, 29); q = `${a} × ${b} = ?`; ans = a * b; spread = 25; }
    else if (kind === 2) { const p = [10, 20, 25, 30, 40, 50, 75][randInt(0, 6)], n = randInt(2, 24) * 20; q = `${n} 的 ${p}% 是多少？`; ans = n * p / 100; spread = Math.max(5, ans / 3 | 0); }
    else if (kind === 3) { const x = randInt(4, 15), m = randInt(2, 9), b = randInt(2, 30); q = `${m}x + ${b} = ${m * x + b}，x = ?`; ans = x; spread = 4; }
    else {
      const a = `${randInt(2, 9)}.${randInt(1, 9)}`, b = `${randInt(2, 9)}.${randInt(1, 9)}`;
      q = `${a} + ${b} = ?`;
      ans = Math.round((parseFloat(a) + parseFloat(b)) * 10) / 10;
      const opts = new Set([ans]);
      while (opts.size < 4) {
        const d = (randInt(1, 14) / 10) * (Math.random() < 0.5 ? -1 : 1);
        const v = Math.round((ans + d) * 10) / 10;
        if (v > 0 && v !== ans) opts.add(v);
      }
      const arr = shuffle([...opts]);
      return { cat: 'math', q, a: arr.map(String), c: arr.indexOf(ans) };
    }
  }
  return { cat: 'math', q, ...buildChoices(ans, spread) };
}

// ------------------------------------------------------------
// Pick `n` questions with mixed categories, no repeats per game.
// ------------------------------------------------------------
const usedIds = new Set();

export function pickQuestions(n = 3, diff = 'easy') {
  const bank = BANK[diff] || BANK.easy;
  const cats = shuffle(Object.keys(CATEGORIES).slice());
  const picked = [];
  for (let i = 0; i < n; i++) {
    const cat = cats[i % cats.length];
    if (cat === 'math' && Math.random() < 0.3) {
      picked.push(makeMathQuestion(diff));
      continue;
    }
    const pool = bank
      .map((qq, idx) => ({ ...qq, _id: diff + idx }))
      .filter(qq => qq.cat === cat && !usedIds.has(qq._id));
    if (pool.length === 0) {
      picked.push(makeMathQuestion(diff));
      continue;
    }
    const choice = pool[Math.floor(Math.random() * pool.length)];
    usedIds.add(choice._id);
    // shuffle answer order so the correct slot varies
    const order = shuffle([0, 1, 2, 3]);
    picked.push({
      cat: choice.cat,
      q: choice.q,
      a: order.map(k => choice.a[k]),
      c: order.indexOf(choice.c),
    });
  }
  return picked;
}

export function resetQuestionPool() { usedIds.clear(); }

export function bankSize(diff) { return BANK[diff].length; }
