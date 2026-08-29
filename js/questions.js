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

export const QUESTION_SCHEMA_VERSION = 1;

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

const RAW_BANK = { easy: EASY, medium: MEDIUM, hard: HARD };
const YEAR_LEVELS = { easy: 'P1–P2', medium: 'P3–P4', hard: 'P5–P6' };
const TOPICS = {
  math: 'number-and-operations', english: 'language-and-vocabulary',
  chinese: 'reading-and-language', general: 'hong-kong-and-world-knowledge',
};
const SKILLS = {
  math: 'calculate-and-reason', english: 'read-and-apply',
  chinese: 'read-and-apply', general: 'recall-and-connect',
};

const LEGACY_ID_MAP = {};

function stableQuestionHash(value) {
  let hash = 0x811c9dc5;
  for (const character of value.normalize('NFKC')) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function annotateBank(difficulty, questions) {
  return questions.map((question, index) => {
    const legacyId = `dg-${difficulty}-${question.cat}-${String(index + 1).padStart(3, '0')}`;
    const id = `dg-${difficulty}-${question.cat}-${stableQuestionHash(`${question.q}\u0000${question.a.join('\u0000')}`)}`;
    LEGACY_ID_MAP[legacyId] = id;
    return {
      ...question,
      id,
      schemaVersion: QUESTION_SCHEMA_VERSION,
      yearLevel: YEAR_LEVELS[difficulty],
      subject: question.cat,
      topic: TOPICS[question.cat],
      skill: SKILLS[question.cat],
      language: question.cat === 'english' ? 'en' : 'zh-HK',
      source: 'DGJS hand-written curriculum bank',
      reviewer: 'DGJS curriculum review',
      reviewStatus: 'pending-curriculum-signoff',
    };
  });
}

export const BANK = Object.fromEntries(Object.entries(RAW_BANK)
  .map(([difficulty, questions]) => [difficulty, annotateBank(difficulty, questions)]));

// ------------------------------------------------------------
// Procedural math — endless variety, difficulty-aware
// ------------------------------------------------------------
function randInt(lo, hi, random = Math.random) { return lo + Math.floor(random() * (hi - lo + 1)); }
function shuffle(arr, random = Math.random) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function seededRandom(seed) {
  let value = Math.max(1, Number(seed) >>> 0);
  return () => ((value = (value * 1664525 + 1013904223) >>> 0) / 4294967296);
}

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
const RECENT_KEY = 'dg-treasure-hunt-recent-questions-v1';
const MASTERY_KEY = 'dg-treasure-hunt-topic-mastery-v1';
const storage = typeof window === 'undefined' ? null : window.localStorage;
function readJson(key, fallback) { try { return JSON.parse(storage?.getItem(key) || '') || fallback; } catch { return fallback; } }
function writeJson(key, value) { try { storage?.setItem(key, JSON.stringify(value)); } catch { /* private mode: play continues without persistence */ } }
export function migrateQuestionIds(ids) {
  return ids.map(id => LEGACY_ID_MAP[id] || id);
}

function recentIds() {
  const stored = readJson(RECENT_KEY, []);
  const migrated = migrateQuestionIds(stored);
  if (migrated.some((id, index) => id !== stored[index])) writeJson(RECENT_KEY, migrated);
  return migrated;
}
function rememberQuestion(id) {
  const next = [...new Set([...recentIds(), id])].slice(-24);
  writeJson(RECENT_KEY, next);
}

export function recordQuestionResult(question, correct) {
  if (!question?.topic) return;
  const mastery = readJson(MASTERY_KEY, {});
  const topic = mastery[question.topic] || { correct: 0, incorrect: 0, attempts: 0 };
  topic.attempts++;
  if (correct) topic.correct++; else topic.incorrect++;
  mastery[question.topic] = topic;
  writeJson(MASTERY_KEY, mastery);
}

export function loadTopicMastery() { return readJson(MASTERY_KEY, {}); }

function masteryPriority(category, mastery) {
  const result = mastery?.[TOPICS[category]];
  if (!result?.attempts) return -1;
  return result.correct / result.attempts;
}

export function rankCategoriesByMastery(categories, mastery, random = Math.random) {
  // Shuffle first so equal-strength subjects still vary without weakening the
  // deterministic seeded-test contract. Lower accuracy and unseen topics lead.
  return shuffle(categories.slice(), random)
    .sort((a, b) => masteryPriority(a, mastery) - masteryPriority(b, mastery));
}

export function pickQuestions(n = 3, diff = 'easy', options = {}) {
  const bank = BANK[diff] || BANK.easy;
  const random = options.seed == null ? Math.random : seededRandom(options.seed);
  const availableCategories = options.categories?.length
    ? options.categories.filter(category => CATEGORIES[category])
    : options.subject ? [options.subject] : Object.keys(CATEGORIES);
  const cats = options.adaptive === false
    ? shuffle(availableCategories.slice(), random)
    : rankCategoriesByMastery(availableCategories, options.mastery ?? loadTopicMastery(), random);
  const recent = new Set(recentIds());
  const picked = [];
  for (let i = 0; i < n; i++) {
    const cat = cats[i % cats.length];
    if (cat === 'math' && options.seed == null && random() < 0.3) {
      picked.push(makeMathQuestion(diff));
      continue;
    }
    const pool = bank
      .filter(qq => qq.cat === cat && (!options.subject || qq.subject === options.subject) && !usedIds.has(qq.id) && !recent.has(qq.id));
    if (pool.length === 0) {
      picked.push(makeMathQuestion(diff));
      continue;
    }
    const choice = pool[Math.floor(random() * pool.length)];
    usedIds.add(choice.id);
    rememberQuestion(choice.id);
    // shuffle answer order so the correct slot varies
    const order = shuffle([0, 1, 2, 3], random);
    picked.push({
      ...choice,
      q: choice.q,
      a: order.map(k => choice.a[k]),
      c: order.indexOf(choice.c),
    });
  }
  return picked;
}

export function resetQuestionPool() { usedIds.clear(); }

export function bankSize(diff) { return BANK[diff].length; }
