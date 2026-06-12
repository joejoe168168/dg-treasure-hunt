// Headless smoke test: load game, start it, walk, open a chest, answer quiz.
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--window-size=1280,800', '--use-gl=angle', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => {
  // /api/leaderboard 404s locally (it only exists when deployed on Vercel)
  if (m.type() === 'error' && !m.location()?.url?.includes('/api/leaderboard')) {
    errors.push('CONSOLE: ' + m.text());
  }
});

await page.goto('http://localhost:8000', { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise(r => setTimeout(r, 3000));

await page.type('#player-name', 'TestGirl');
await page.click('#start-btn');
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: 'shot-2-game.png' });

// walk toward the harbour
await page.keyboard.down('KeyW');
await new Promise(r => setTimeout(r, 2000));
await page.keyboard.up('KeyW');
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: 'shot-3-walk.png' });

// teleport beside chest 0 (Clock Tower) and open it via the debug hook
await page.evaluate(() => {
  const { girl, chests, openChest } = window.__dg;
  const c = chests[0];
  girl.position.set(c.position.x + 2, 0, c.position.z - 2);
  openChest(c);
});
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: 'shot-4-quiz.png' });

// answer 3 questions (always click the first answer)
for (let i = 0; i < 3; i++) {
  await page.click('#quiz-answers .answer-btn');
  await new Promise(r => setTimeout(r, 1600));
}
await page.waitForFunction(
  () => !document.getElementById('chest-result').classList.contains('hidden'),
  { timeout: 15000 });
await page.screenshot({ path: 'shot-5-result.png' });
await page.click('#chest-continue-btn');
await new Promise(r => setTimeout(r, 600));

const final = await page.evaluate(() => ({
  score: document.getElementById('hud-score').textContent,
  chests: document.getElementById('hud-chests').textContent,
  opened: window.__dg.chests[0].userData.opened,
  phase: window.__dg.state.phase,
}));
console.log('Final:', JSON.stringify(final));
console.log('Errors:', errors.length ? errors.join('\n') : 'NONE');
await browser.close();
process.exit(errors.length ? 1 : 0);
