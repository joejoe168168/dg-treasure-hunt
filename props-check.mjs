// Capture screenshots / functional checks for the newest props.
import puppeteer from 'puppeteer-core';

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
await new Promise(r => setTimeout(r, 1500));

// photo spot test
const photo = await pg.evaluate(async () => {
  const dg = window.__dg;
  const before = dg.state.score;
  dg.girl.position.set(-62, 0, 122);
  await new Promise(r => setTimeout(r, 400));
  return { before, after: dg.state.score };
});
console.log('Photo spot:', JSON.stringify(photo));

// screenshots
await pg.evaluate(() => {
  window.__dg.state.phase = 'paused-debug';
  window.__camLock = true;
  document.getElementById('hud').style.display = 'none';
});
const VIEWS = [
  { name: 'prop-wheel', cam: [28, 14, 190], look: [28, 15, 248] },
  { name: 'prop-dragon', cam: [-12, 4, -30], look: [-12, 1.5, 0] },
];
for (const v of VIEWS) {
  await pg.evaluate((c, l) => {
    const cam = window.__dg.camera;
    cam.position.set(...c);
    cam.lookAt(...l);
  }, v.cam, v.look);
  await new Promise(r => setTimeout(r, 600));
  await pg.screenshot({ path: v.name + '.png' });
}
await b.close();
console.log('done');
