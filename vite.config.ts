import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'examples',
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: '../examples/dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'examples/index.html'),
        basic: resolve(__dirname, 'examples/basic/index.html'),
        minimal: resolve(__dirname, 'examples/minimal/index.html'),
        advanced: resolve(__dirname, 'examples/advanced/index.html'),
      },
    },
    terserOptions: {
      compress: {
        keep_classnames: /View$|Layout$|Page$|Component$/,
      },
      mangle: {
        keep_classnames: /View$|Layout$|Page$|Component$/,
        reserved: ['AppView'],
      },
    }
  },
  server: {
    port: 3000,
    open: true,
  },
});
