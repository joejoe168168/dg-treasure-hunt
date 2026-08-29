import puppeteer from 'puppeteer-core';
import { browserExecutable } from './browser-path.mjs';

const browser = await puppeteer.launch({
  executablePath: browserExecutable(), headless: 'new',
  args: ['--use-gl=angle', '--enable-unsafe-swiftshader'],
});

async function measure(name, mobile) {
  const page = await browser.newPage();
  if (mobile) await page.emulate({
    name: 'Performance mobile',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    viewport: { width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true, isLandscape: true },
  });
  else await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => window.__dg?.renderer);
  await page.type('#player-name', `${name}Audit`);
  await page.click('#start-btn');
  const result = await page.evaluate(() => new Promise(resolve => {
    // Let the start transition and first asset/layout work settle before
    // measuring gameplay frames; otherwise the audit reports startup work as
    // a false long-frame regression.
    setTimeout(() => {
        let frames = 0;
        let maxFrameGap = 0;
        let previousFrame = performance.now();
        const started = performance.now();
        const sample = () => {
          const now = performance.now();
          maxFrameGap = Math.max(maxFrameGap, now - previousFrame);
          previousFrame = now;
          frames++;
      if (performance.now() - started < 5000) requestAnimationFrame(sample);
      else {
        const info = window.__dg.renderer.info;
        resolve({
          fps: frames / ((performance.now() - started) / 1000),
          maxFrameGap,
          calls: info.render.calls,
          triangles: info.render.triangles,
          geometries: info.memory.geometries,
          textures: info.memory.textures,
          systems: window.__dg.world.systems.counts(),
        });
      }
    };
        requestAnimationFrame(sample);
    }, 1000);
  }));
  await page.close();
  return result;
}

const desktop = await measure('Desktop', false);
const mobile = await measure('Mobile', true);
await browser.close();

console.log('Desktop:', JSON.stringify(desktop));
console.log('Mobile:', JSON.stringify(mobile));
const failures = [];
if (desktop.fps < 30) failures.push(`desktop ${desktop.fps.toFixed(1)} FPS < 30`);
if (mobile.fps < 24) failures.push(`mobile ${mobile.fps.toFixed(1)} FPS < 24`);
if (desktop.calls > 1000) failures.push(`desktop ${desktop.calls} draw calls > 1000`);
if (mobile.calls > 1050) failures.push(`mobile ${mobile.calls} draw calls > 1050`);
if (desktop.maxFrameGap > 100 || mobile.maxFrameGap > 100) failures.push(`long frame gap > 100 ms (desktop ${desktop.maxFrameGap.toFixed(1)} ms, mobile ${mobile.maxFrameGap.toFixed(1)} ms)`);
if (desktop.geometries > 1000 || mobile.geometries > 1000) failures.push('geometry budget exceeded');
if (desktop.textures > 80 || mobile.textures > 80) failures.push('texture budget exceeded');
if (failures.length) {
  console.error(`Performance audit failed: ${failures.join('; ')}`);
  process.exit(1);
}
console.log('Performance audit passed.');
