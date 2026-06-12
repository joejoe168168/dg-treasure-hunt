// Visual verification: dress close-up + mobile emulation.
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--use-gl=angle', '--enable-unsafe-swiftshader'],
});

// ---- 1) dress close-up ----
{
  const pg = await browser.newPage();
  await pg.setViewport({ width: 800, height: 900 });
  await pg.goto('http://localhost:8000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2500));
  await pg.type('#player-name', 'X');
  await pg.click('#start-btn');
  await new Promise(r => setTimeout(r, 800));
  // morning gameplay view
  await pg.screenshot({ path: 'verify-morning.png' });
  // toggle to night for comparison
  await pg.click('#time-btn');
  await new Promise(r => setTimeout(r, 400));
  await pg.screenshot({ path: 'verify-night.png' });
  await pg.click('#time-btn');
  await new Promise(r => setTimeout(r, 300));
  await pg.evaluate(() => {
    const { girl, camera, state } = window.__dg;
    state.phase = 'paused-debug';
    window.__camLock = true;
    girl.rotation.y = Math.PI;
    document.getElementById('hud').style.display = 'none';
    camera.position.set(girl.position.x + 0.9, 2.2, girl.position.z - 3.8);
    camera.lookAt(girl.position.x, 1.4, girl.position.z);
  });
  await new Promise(r => setTimeout(r, 600));
  await pg.screenshot({ path: 'verify-dress.png' });
  await pg.close();
}

// ---- 2) mobile emulation (landscape phone) ----
{
  const pg = await browser.newPage();
  await pg.emulate({
    viewport: { width: 844, height: 390, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const errors = [];
  pg.on('pageerror', e => errors.push(e.message));
  await pg.goto('http://localhost:8000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2500));
  await pg.screenshot({ path: 'verify-mobile-start.png' });
  await pg.type('#player-name', 'M');
  await pg.tap('#start-btn');
  await new Promise(r => setTimeout(r, 1200));
  const touchClass = await pg.evaluate(() => document.body.classList.contains('touch-device'));
  // joystick drag UP -> girl should move forward (z increases)
  const z0 = await pg.evaluate(() => window.__dg.girl.position.z);
  await pg.touchscreen.touchStart(150, 300);
  await pg.touchscreen.touchMove(150, 255);
  await new Promise(r => setTimeout(r, 300));
  const joyVis = await pg.evaluate(() => {
    const b = document.getElementById('joystick-base');
    const r = b.getBoundingClientRect();
    return b.style.display === 'block' &&
      r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0;
  });
  await new Promise(r => setTimeout(r, 900));
  await pg.screenshot({ path: 'verify-mobile-play.png' });
  await pg.touchscreen.touchEnd();
  const z1 = await pg.evaluate(() => window.__dg.girl.position.z);
  // joystick drag DOWN on the bottom-RIGHT -> girl should move BACK (z decreases)
  await pg.touchscreen.touchStart(650, 290);
  await pg.touchscreen.touchMove(650, 335);
  await new Promise(r => setTimeout(r, 1200));
  await pg.screenshot({ path: 'verify-mobile-right-joy.png' });
  await pg.touchscreen.touchEnd();
  const z2 = await pg.evaluate(() => window.__dg.girl.position.z);
  console.log(`joystick base visible on screen: ${joyVis}`);
  console.log(`forward: z ${z0.toFixed(1)} -> ${z1.toFixed(1)} (should increase) | backward: -> ${z2.toFixed(1)} (should decrease)`);
  // night mode on mobile (no point lights — must still look good)
  await pg.tap('#time-btn');
  await new Promise(r => setTimeout(r, 500));
  await pg.screenshot({ path: 'verify-mobile-night.png' });
  const moved = await pg.evaluate(() => window.__dg.girl.position.z);
  console.log('touch-device class:', touchClass, '| girl z after joystick (started -15):', moved.toFixed(1));
  console.log('mobile errors:', errors.length ? errors.join('; ') : 'NONE');
  await pg.close();
}

await browser.close();
console.log('verify done');
