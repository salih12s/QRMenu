import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{ts,tsx,js,jsx}'),
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-primary)',
          background: 'var(--color-background)',
          card: 'var(--color-card)',
          'card-2': 'var(--color-card-2)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          cream: 'var(--color-cream)',
          border: 'var(--color-border)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.35)',
        glow: '0 0 0 1px var(--color-border), 0 8px 32px rgba(216,181,109,0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
