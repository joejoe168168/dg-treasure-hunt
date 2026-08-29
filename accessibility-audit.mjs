import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import { browserExecutable } from './browser-path.mjs';

const browser = await puppeteer.launch({
  executablePath: browserExecutable(), headless: 'new',
  args: ['--use-gl=angle', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle0', timeout: 60000 });
await page.waitForFunction(() => window.__dg?.renderer);

const structure = await page.evaluate(() => {
  const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const dialogs = [...document.querySelectorAll('[role="dialog"]')];
  return {
    duplicates,
    dialogs: dialogs.length,
    invalidDialogs: dialogs.filter(dialog => dialog.getAttribute('aria-modal') !== 'true' || !dialog.getAttribute('aria-labelledby')).length,
    initialFocus: document.activeElement?.id,
  };
});
assert.deepEqual(structure.duplicates, []);
assert.equal(structure.dialogs, 5);
assert.equal(structure.invalidDialogs, 0);
assert.equal(structure.initialFocus, 'player-name');

await page.type('#player-name', 'A11yAudit');
await page.click('#start-btn');
await page.click('#pause-btn');
await page.waitForFunction(() => document.activeElement?.id === 'reduced-motion-setting');
await page.keyboard.down('Shift'); await page.keyboard.press('Tab'); await page.keyboard.up('Shift');
assert.equal(await page.evaluate(() => document.activeElement?.id), 'resume-btn', 'Shift+Tab should wrap within settings');
await page.click('#resume-btn');

await page.evaluate(() => {
  const chest = window.__dg.chests[0];
  window.__dg.girl.position.set(chest.position.x, 0, chest.position.z - 2);
  window.__dg.openChest(chest);
});
await page.waitForFunction(() => document.activeElement?.classList.contains('answer-btn'));
const answerCount = await page.$$eval('.answer-btn', buttons => buttons.length);
assert.equal(answerCount, 4);
await page.click('.answer-btn');
const symbolicFeedback = await page.evaluate(() => [...document.querySelectorAll('.answer-btn')]
  .some(button => ['correct', 'wrong'].some(kind => button.classList.contains(kind)) &&
    getComputedStyle(button, '::after').content !== 'none'));
assert.equal(symbolicFeedback, true, 'answer feedback should include a symbol/text pseudo-label');

const errors = await page.evaluate(() => window.__accessibilityErrors || []);
assert.deepEqual(errors, []);
await browser.close();
console.log('Accessibility audit passed: dialogs, labels, focus trap, quiz focus and symbolic feedback.');
