import { Coffee } from 'lucide-react';
import type { Setting } from '../../types';
import { resolveImageUrl } from '../../utils/format';

const FALLBACK_LOGO = '/logo.jpeg';

export function Hero({ settings }: { settings: Setting }) {
  const logo = resolveImageUrl(settings.logoUrl) ?? FALLBACK_LOGO;

  return (
    <header className="relative overflow-hidden border-b border-brand-border bg-brand-card">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(216,181,109,0.18) 0%, transparent 60%)',
        }}
      />
      <div className="relative max-w-3xl mx-auto px-5 py-12 sm:py-16 text-center">
        <div className="flex justify-center mb-5">
          {logo ? (
            <img
              src={logo}
              alt={settings.cafeName}
              decoding="async"
              loading="eager"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
              style={{ imageRendering: 'auto' }}
              className="h-28 w-28 sm:h-36 sm:w-36 rounded-full object-cover ring-2 ring-brand-primary/40 shadow-glow bg-brand-background"
            />
          ) : (
            <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-full bg-brand-background ring-2 ring-brand-primary/40 grid place-items-center shadow-glow">
              <Coffee className="h-12 w-12 text-brand-primary" />
            </div>
          )}
        </div>

        <h1
          className="font-display text-3xl sm:text-5xl font-bold tracking-tight"
          style={{ color: 'var(--color-cream)' }}
        >
          {settings.cafeName}
        </h1>

        {settings.slogan && (
          <p className="mt-2 text-sm sm:text-base tracking-[0.2em] uppercase text-brand-primary">
            {settings.slogan}
          </p>
        )}

        <p className="mt-4 text-brand-muted text-sm sm:text-base">Menümüzü keşfedin</p>
      </div>
    </header>
  );
}
