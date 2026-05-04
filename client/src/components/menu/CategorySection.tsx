import type { CategoryWithProducts, Product } from '../../types';
import { ProductCard } from './ProductCard';
import { SectionTitle } from './FeaturedSection';

interface Props {
  category: CategoryWithProducts;
  onSelect: (p: Product) => void;
}

export function CategorySection({ category, onSelect }: Props) {
  if (category.products.length === 0) return null;
  return (
    <section id={`cat-${category.id}`} className="space-y-3 scroll-mt-24">
      <SectionTitle title={category.name} description={category.description} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.products.map((p) => (
          <ProductCard key={p.id} product={p} onClick={onSelect} />
        ))}
      </div>
    </section>
  );
}
