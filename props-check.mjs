// Capture screenshots of the new HK props for visual verification.
import puppeteer from 'puppeteer-core';

const VIEWS = [
  { name: 'prop-temple', cam: [-44, 6, -78], look: [-44, 3, -96] },
  { name: 'prop-scaffold', cam: [10, 8, -44], look: [24, 7, -56] },
  { name: 'prop-laundry', cam: [-28, 5, -44], look: [-28, 6, -70] },
  { name: 'prop-luckycat', cam: [8, 2.5, 25], look: [11.5, 1.3, 30] },
  { name: 'prop-pedlight', cam: [5, 3, -6], look: [8.6, 2.5, 0] },
  { name: 'prop-pigeons', cam: [-12, 2.5, -30], look: [-16, 0.5, -34] },
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
// night-mode bloom shot of Nathan Road neon
await pg.evaluate(() => {
  document.getElementById('hud').style.display = '';
  document.getElementById('time-btn').click();
  document.getElementById('hud').style.display = 'none';
  const cam = window.__dg.camera;
  cam.position.set(0, 8, 38);
  cam.lookAt(2, 10, 70);
});
await new Promise(r => setTimeout(r, 700));
await pg.screenshot({ path: 'prop-night-bloom.png' });
await b.close();
console.log('done');
