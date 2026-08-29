import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        v1: resolve(root, 'index.html'),
        v2: resolve(root, 'v2/index.html'),
      },
    },
  },
});
