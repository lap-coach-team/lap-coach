import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Відносні шляхи: збірка відкривається з підпапки на GitHub Pages.
  base: './',
  test: {
    // jsdom дає DOMParser для читання GPX і DOM для тестів екрана.
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
});
