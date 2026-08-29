import { existsSync } from 'node:fs';
import { platform } from 'node:os';

const candidates = {
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ],
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
  ],
};

export function browserExecutable() {
  const configured = process.env.CHROME_PATH || process.env.BROWSER_PATH;
  if (configured && existsSync(configured)) return configured;

  const found = (candidates[platform()] || []).find(existsSync);
  if (found) return found;

  throw new Error(
    'No supported Chrome/Edge executable found. Set CHROME_PATH to the browser executable.',
  );
}
