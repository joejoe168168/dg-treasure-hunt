// Dev tool: sanity-check the question bank.
import { BANK, QUESTION_SCHEMA_VERSION } from './js/questions.js';

let total = 0, problems = 0;
const globalSeen = new Set();
for (const [tier, list] of Object.entries(BANK)) {
  const counts = {};
  const seen = new Set();
  for (const q of list) {
    total++;
    counts[q.cat] = (counts[q.cat] || 0) + 1;
    if (q.a.length !== 4) { console.log(`[${tier}] not 4 options: ${q.q}`); problems++; }
    if (q.c < 0 || q.c > 3) { console.log(`[${tier}] bad index: ${q.q}`); problems++; }
    if (new Set(q.a).size !== 4) { console.log(`[${tier}] duplicate options: ${q.q}`); problems++; }
    if (seen.has(q.q)) { console.log(`[${tier}] duplicate question: ${q.q}`); problems++; }
    if (q.schemaVersion !== QUESTION_SCHEMA_VERSION || !q.id || !q.subject || !q.topic || !q.skill) {
      console.log(`[${tier}] invalid schema metadata: ${q.q}`); problems++;
    }
    seen.add(q.q);
    globalSeen.add(q.q);
  }
  console.log(`${tier}: ${list.length} questions`, counts);
}
console.log(`TOTAL: ${total} (unique across tiers: ${globalSeen.size}), problems: ${problems}`);
