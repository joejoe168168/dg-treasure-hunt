// Capture screenshots of the new HK props for visual verification.
import puppeteer from 'puppeteer-core';

const VIEWS = [
  { name: 'prop-lanterns', cam: [-28, 5, -38], look: [-28, 7, -70] },
  { name: 'prop-gulls', cam: [0, 10, 112], look: [10, 11, 135] },
  { name: 'prop-bauhinia', cam: [-52, 2.5, -97], look: [-52, 1, -103] },
];

const b = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--use-gl=angle', '--enable-unsafe-swiftshader'],
});
const pg = await b.newPage();
pg.on('pageerror', e => console.log('PAGEERROR:', e.message));
await pg.setViewport({ width: 1280, height: 720 });
await pg.goto('http://localhost:8000', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 3000));

await pg.type('#player-name', 'X');
await pg.click('#start-btn');
await new Promise(r => setTimeout(r, 1000));

// --- MTR teleport functional test ---
const mtrTest = await pg.evaluate(async () => {
  const dg = window.__dg;
  dg.girl.position.set(7, 0, 40);            // beside TST station
  await new Promise(r => setTimeout(r, 300));
  const promptShown = !document.getElementById('interact-prompt').classList.contains('hidden');
  const nearMtr = dg.state.nearMtr;
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }));
  await new Promise(r => setTimeout(r, 900));
  return { promptShown, nearMtr, after: { x: dg.girl.position.x, z: dg.girl.position.z } };
});
console.log('MTR test:', JSON.stringify(mtrTest));

// --- bauhinia pickup test ---
const bau = await pg.evaluate(async () => {
  const dg = window.__dg;
  const before = dg.state.score;
  dg.girl.position.set(-52, 0, -103);
  await new Promise(r => setTimeout(r, 500));
  return { before, after: dg.state.score };
});
console.log('Bauhinia test:', JSON.stringify(bau));

await pg.evaluate(() => {
  window.__dg.state.phase = 'paused-debug';
  window.__camLock = true;
  document.getElementById('hud').style.display = 'none';
});
for (const v of VIEWS) {
  await pg.evaluate((c, l) => {
    const cam = window.__dg.camera;
    cam.position.set(...c);
    cam.lookAt(...l);
  }, v.cam, v.look);
  await new Promise(r => setTimeout(r, 500));
  await pg.screenshot({ path: v.name + '.png' });
}
await b.close();
console.log('done');
