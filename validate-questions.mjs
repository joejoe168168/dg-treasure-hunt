// Dev tool: sanity-check the question bank.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const src = readFileSync('js/questions.js', 'utf8') + '\nexport { BANK };\n';
const tmp = join(mkdtempSync(join(tmpdir(), 'dgq-')), 'questions.mjs');
writeFileSync(tmp, src);
const { BANK } = await import(pathToFileURL(tmp));

let total = 0, problems = 0;
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
    seen.add(q.q);
  }
  console.log(`${tier}: ${list.length} questions`, counts);
}
console.log(`TOTAL: ${total}, problems: ${problems}`);
