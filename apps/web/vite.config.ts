import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import fs from 'fs';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'project-data-server',
        configureServer(server) {
          server.middlewares.use('/api/live-project-data', (req, res, next) => {
            const fileName = req.url ? req.url.replace(/^\//, '') : '';
            const downloadPath = path.join('C:', 'Users', 'himan', 'Downloads', 'project data', fileName);
            if (fs.existsSync(downloadPath)) {
              res.setHeader('Content-Type', 'text/csv; charset=utf-8');
              res.setHeader('Access-Control-Allow-Origin', '*');
              fs.createReadStream(downloadPath).pipe(res);
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
