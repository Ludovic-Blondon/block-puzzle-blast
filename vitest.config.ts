import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '../locales/i18n': path.resolve(__dirname, 'src/__mocks__/i18n.ts'),
    },
  },
});
