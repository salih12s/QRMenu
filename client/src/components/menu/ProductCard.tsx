import clsx from 'clsx';
import { Coffee } from 'lucide-react';
import type { Product } from '../../types';
import { formatPrice, resolveImageUrl } from '../../utils/format';

interface Props {
  product: Product;
  onClick: (p: Product) => void;
}

export function ProductCard({ product, onClick }: Props) {
  const img = resolveImageUrl(product.imageUrl);

  return (
    <button
      type="button"
      onClick={() => onClick(product)}
      className="group text-left bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-card hover:shadow-glow hover:-translate-y-0.5 transition focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
    >
      <div className="relative aspect-square bg-[var(--color-card-2)] overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-brand-muted">
            <Coffee className="h-10 w-10 opacity-50" />
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {product.isPopular && <Badge tone="primary">Popüler</Badge>}
          {product.isNew && <Badge tone="cream">Yeni</Badge>}
          {product.isRecommended && <Badge tone="dark">Şefin Önerisi</Badge>}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-brand-text line-clamp-2 leading-snug">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-sm text-brand-muted line-clamp-2">{product.description}</p>
        )}
        {(product.calories !== null && product.calories !== undefined) || product.allergenInfo ? (
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wider">
            {product.calories !== null && product.calories !== undefined && (
              <span className="px-2 py-0.5 rounded-full border border-brand-border text-brand-muted">
                {product.calories} kcal
              </span>
            )}
            {product.allergenInfo && (
              <span
                className="px-2 py-0.5 rounded-full border border-brand-border text-brand-muted truncate max-w-full"
                title={product.allergenInfo}
              >
                Alerjen: {product.allergenInfo}
              </span>
            )}
          </div>
        ) : null}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-brand-primary font-bold tracking-wide">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs text-brand-muted group-hover:text-brand-primary transition">
            Detay →
          </span>
        </div>
      </div>
    </button>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: 'primary' | 'cream' | 'dark';
  children: React.ReactNode;
}) {
  return (
    <span
      className={clsx(
        'text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur',
        tone === 'primary' && 'bg-brand-primary text-black',
        tone === 'cream' && 'bg-[var(--color-cream)] text-black',
        tone === 'dark' && 'bg-black/70 text-brand-primary border border-brand-border',
      )}
    >
      {children}
    </span>
  );
}
