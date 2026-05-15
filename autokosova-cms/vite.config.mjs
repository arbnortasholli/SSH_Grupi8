import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  server: {
    port: 3001
  },
  resolve: {
    alias: {
      assets: path.resolve(process.cwd(), 'src/assets'),
      components: path.resolve(process.cwd(), 'src/components'),
      config: path.resolve(process.cwd(), 'src/config'),
      contexts: path.resolve(process.cwd(), 'src/contexts'),
      data: path.resolve(process.cwd(), 'src/data'),
      hooks: path.resolve(process.cwd(), 'src/hooks'),
      layouts: path.resolve(process.cwd(), 'src/layouts'),
      'menu-items': path.resolve(process.cwd(), 'src/menu-items.js'),
      'menu-items-collapse': path.resolve(process.cwd(), 'src/menu-items-collapse.js'),
      routes: path.resolve(process.cwd(), 'src/routes'),
      store: path.resolve(process.cwd(), 'src/store'),
      utils: path.resolve(process.cwd(), 'src/utils'),
      views: path.resolve(process.cwd(), 'src/views')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: [process.cwd()],
        loadPaths: [process.cwd()]
      }
    }
  },
  plugins: [react()]
});
