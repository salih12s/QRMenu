import type { Setting } from '../types';

/**
 * Apply settings palette to the document root as CSS variables.
 * Tailwind's `brand.*` colors read these vars at runtime.
 */
export function applyTheme(settings: Pick<
  Setting,
  | 'themePrimaryColor'
  | 'themeBackgroundColor'
  | 'themeCardColor'
  | 'themeTextColor'
  | 'themeMutedColor'
>) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', settings.themePrimaryColor);
  root.style.setProperty('--color-background', settings.themeBackgroundColor);
  root.style.setProperty('--color-card', settings.themeCardColor);
  root.style.setProperty('--color-text', settings.themeTextColor);
  root.style.setProperty('--color-muted', settings.themeMutedColor);

  // Derived border color (primary @ 25% alpha)
  root.style.setProperty('--color-border', hexToRgba(settings.themePrimaryColor, 0.25));
}

function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
