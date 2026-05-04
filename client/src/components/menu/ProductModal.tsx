import { AnimatePresence, motion } from 'framer-motion';
import { X, Coffee, Tag } from 'lucide-react';
import { useEffect } from 'react';
import type { Product } from '../../types';
import { formatPrice, resolveImageUrl } from '../../utils/format';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: Props) {
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            className="relative w-full sm:max-w-lg bg-brand-card border border-brand-border rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-glow max-h-[92vh] flex flex-col"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="absolute top-3 right-3 z-10 h-9 w-9 grid place-items-center rounded-full bg-black/60 text-brand-text hover:text-brand-primary border border-brand-border"
            >
              <X className="h-4 w-4" />
            </button>

            <ProductImage product={product} />

            <div className="p-5 sm:p-6 overflow-y-auto overflow-x-hidden min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {product.isPopular && <MiniBadge>Popüler</MiniBadge>}
                {product.isNew && <MiniBadge variant="cream">Yeni</MiniBadge>}
                {product.isRecommended && <MiniBadge variant="dark">Şefin Önerisi</MiniBadge>}
              </div>

              <h2
                id="product-modal-title"
                className="font-display text-2xl sm:text-3xl font-bold leading-tight break-words"
                style={{ color: 'var(--color-cream)', overflowWrap: 'anywhere', wordBreak: 'break-word' }}
              >
                {product.name}
              </h2>

              {product.category && (
                <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-brand-muted">
                  <Tag className="h-3 w-3" />
                  {product.category.name}
                </div>
              )}

              {product.description && (
                <p
                  className="mt-3 text-sm sm:text-base text-brand-text/90 leading-relaxed break-words"
                  style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                >
                  {product.description}
                </p>
              )}

              {product.allergenInfo && (
                <div
                  className="mt-4 text-xs text-brand-muted border border-brand-border rounded-xl p-3 break-words"
                  style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                >
                  <span className="font-semibold text-brand-primary">Alerjen bilgisi: </span>
                  {product.allergenInfo}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <span className="text-brand-muted text-sm">Fiyat</span>
                <span className="text-2xl font-bold text-brand-primary">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProductImage({ product }: { product: Product }) {
  const img = resolveImageUrl(product.imageUrl);
  return (
    <div
      className="relative w-full bg-[var(--color-card-2)] overflow-hidden"
      style={{ aspectRatio: '16 / 9', maxHeight: '40vh' }}
    >
      {img ? (
        <img
          src={img}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-brand-muted">
          <Coffee className="h-12 w-12 opacity-50" />
        </div>
      )}
    </div>
  );
}

function MiniBadge({
  children,
  variant = 'primary',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'cream' | 'dark';
}) {
  const cls =
    variant === 'cream'
      ? 'bg-[var(--color-cream)] text-black'
      : variant === 'dark'
        ? 'bg-black/70 text-brand-primary border border-brand-border'
        : 'bg-brand-primary text-black';
  return (
    <span
      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${cls}`}
    >
      {children}
    </span>
  );
}
