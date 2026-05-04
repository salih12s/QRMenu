import { Sparkles } from 'lucide-react';
import type { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface Props {
  products: Product[];
  onSelect: (p: Product) => void;
}

export function FeaturedSection({ products, onSelect }: Props) {
  if (products.length === 0) return null;
  return (
    <section className="space-y-3">
      <SectionTitle icon={<Sparkles className="h-4 w-4" />} title="Öne Çıkanlar" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onClick={onSelect} />
        ))}
      </div>
    </section>
  );
}

export function SectionTitle({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string | null;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 text-brand-primary">
          {icon}
          {title}
        </h2>
        {description && <p className="text-sm text-brand-muted mt-0.5">{description}</p>}
      </div>
    </div>
  );
}
