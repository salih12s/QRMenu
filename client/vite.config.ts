import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
  },
  css: {
    // PostCSS yapılandırmasını açıkça belirt; aksi halde Vite cwd'ye göre
    // bulamayıp Tailwind'i devre dışı bırakabiliyor (ilk yüklemede stilsiz sayfa).
    postcss: path.join(__dirname, 'postcss.config.js'),
  },
  optimizeDeps: {
    // İlk istekte CSS pipeline hazır olsun
    include: ['react', 'react-dom'],
  },
});
