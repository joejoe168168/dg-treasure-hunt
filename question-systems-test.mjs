import assert from 'node:assert/strict';
import { BANK, migrateQuestionIds, pickQuestions, resetQuestionPool } from './js/questions.js';

for (const [difficulty, questions] of Object.entries(BANK)) {
  assert.equal(questions.length, 200, `${difficulty} should retain 200 questions`);
  for (const question of questions) {
    assert.match(question.id, /^dg-(easy|medium|hard)-(math|english|chinese|general)-[0-9a-f]{8}$/);
    assert.ok(question.yearLevel && question.topic && question.skill && question.language);
    assert.equal(question.schemaVersion, 1);
    assert.equal(question.reviewStatus, 'pending-curriculum-signoff');
    assert.equal(new Set(question.a).size, 4);
  }
}
assert.equal(migrateQuestionIds(['dg-easy-math-001'])[0], BANK.easy[0].id,
  'legacy position-based IDs should migrate to stable content IDs');
assert.equal(new Set(Object.values(BANK).flat().map(question => question.id)).size, 600,
  'stable IDs must be unique across the whole bank');
resetQuestionPool();
const first = pickQuestions(3, 'medium', { seed: 20260712 });
resetQuestionPool();
const second = pickQuestions(3, 'medium', { seed: 20260712 });
assert.deepEqual(first.map(question => [question.id, question.a, question.c]), second.map(question => [question.id, question.a, question.c]));

resetQuestionPool();
const adaptive = pickQuestions(3, 'easy', {
  seed: 42,
  mastery: {
    'number-and-operations': { correct: 1, incorrect: 9, attempts: 10 },
    'language-and-vocabulary': { correct: 4, incorrect: 6, attempts: 10 },
    'reading-and-language': { correct: 7, incorrect: 3, attempts: 10 },
    'hong-kong-and-world-knowledge': { correct: 10, incorrect: 0, attempts: 10 },
  },
});
assert.deepEqual(new Set(adaptive.map(question => question.subject)), new Set(['math', 'english', 'chinese']));
assert.ok(adaptive.every(question => question.id.startsWith('dg-easy-')), 'adaptive selection must stay inside the chosen difficulty');
resetQuestionPool();
const balancedPractice = pickQuestions(3, 'medium', { seed: 99, categories: ['math', 'english', 'chinese'] });
assert.deepEqual(new Set(balancedPractice.map(question => question.subject)), new Set(['math', 'english', 'chinese']));
assert.equal(new Set(Object.values(BANK).flat().map(question => question.q)).size, 600);
console.log('Question metadata and deterministic selection tests passed.');
