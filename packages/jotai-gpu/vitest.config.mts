import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { 'jotai-gpu': resolve('packages/jotai-gpu/src') } },
});
