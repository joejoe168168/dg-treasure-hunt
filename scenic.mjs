// Capture scenic screenshots of landmark areas for visual verification.
import puppeteer from 'puppeteer-core';

const VIEWS = [
  { name: 'shot-a-start', ui: true },
  { name: 'shot-b-waterfront', cam: [-45, 14, 88], look: [-60, 8, 120] },
  { name: 'shot-c-peninsula', cam: [-24, 11, 108], look: [-24, 12, 80] },
  { name: 'shot-d-k11', cam: [12, 14, 84], look: [42, 10, 114] },
  { name: 'shot-e-mosque-church', cam: [0, 10, -2], look: [-19, 5, 22] },
  { name: 'shot-f-templest', cam: [-28, 8, -25], look: [-28, 3, -60] },
  { name: 'shot-g-isquare-chungking', cam: [0, 10, 40], look: [3, 12, 70] },
];

const b = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--use-gl=angle', '--enable-unsafe-swiftshader'],
});
const pg = await b.newPage();
await pg.setViewport({ width: 1280, height: 720 });
await pg.goto('http://localhost:8000', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 3000));
await pg.screenshot({ path: VIEWS[0].name + '.png' });

await pg.type('#player-name', 'X');
await pg.click('#start-btn');
await new Promise(r => setTimeout(r, 1000));
await pg.evaluate(() => {
  window.__dg.state.phase = 'paused-debug';
  window.__camLock = true;
  document.getElementById('hud').style.display = 'none';
});
for (const v of VIEWS.slice(1)) {
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
