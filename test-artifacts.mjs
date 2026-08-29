import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DIRECTORY = 'test-artifacts';

export function artifactPath(filename) {
  mkdirSync(DIRECTORY, { recursive: true });
  return join(DIRECTORY, filename);
}
