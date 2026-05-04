import { useEffect, useMemo, useState } from 'react';
import { useMenu } from '../hooks/useMenu';
import { applyTheme } from '../theme/applyTheme';
import { PublicLayout } from '../layouts/PublicLayout';
import { Hero } from '../components/menu/Hero';
import { SearchBar } from '../components/menu/SearchBar';
import { CategoryTabs } from '../components/menu/CategoryTabs';
import { FeaturedSection } from '../components/menu/FeaturedSection';
import { CategorySection } from '../components/menu/CategorySection';
import { ProductModal } from '../components/menu/ProductModal';
import type { Product } from '../types';

export function MenuPage() {
  const { data, isLoading, isError, refetch } = useMenu();
  const [activeId, setActiveId] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    if (data?.settings) applyTheme(data.settings);
  }, [data?.settings]);

  const filteredCategories = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLocaleLowerCase('tr-TR');
    return data.categories
      .filter((c) => activeId === 'all' || c.id === activeId)
      .map((c) => ({
        ...c,
        products: q
          ? c.products.filter(
              (p) =>
                p.name.toLocaleLowerCase('tr-TR').includes(q) ||
                p.description?.toLocaleLowerCase('tr-TR').includes(q),
            )
          : c.products,
      }));
  }, [data, activeId, search]);

  const featured = useMemo(() => {
    if (!data) return [];
    if (search.trim() || activeId !== 'all') return [];
    const all = data.categories.flatMap((c) => c.products);
    return all.filter((p) => p.isPopular || p.isRecommended || p.isNew).slice(0, 6);
  }, [data, search, activeId]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen grid place-items-center text-brand-muted">
          Menü yükleniyor...
        </div>
      </PublicLayout>
    );
  }

  if (isError || !data) {
    return (
      <PublicLayout>
        <div className="min-h-screen grid place-items-center px-6 text-center">
          <div className="space-y-3">
            <p className="text-brand-text">Menü yüklenemedi.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-full bg-brand-primary text-black font-semibold"
            >
              Tekrar dene
            </button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout settings={data.settings}>
      <Hero settings={data.settings} />

      <div className="max-w-5xl mx-auto px-5 pt-6 pb-16 space-y-8">
        <SearchBar value={search} onChange={setSearch} />

        <CategoryTabs categories={data.categories} activeId={activeId} onSelect={setActiveId} />

        {featured.length > 0 && (
          <FeaturedSection products={featured} onSelect={setSelected} />
        )}

        {filteredCategories.every((c) => c.products.length === 0) ? (
          <EmptyState search={search} />
        ) : (
          <div className="space-y-10">
            {filteredCategories.map((c) => (
              <CategorySection key={c.id} category={c} onSelect={setSelected} />
            ))}
          </div>
        )}
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </PublicLayout>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="text-center py-16 text-brand-muted">
      {search ? (
        <>
          <p className="text-brand-text">"{search}" için sonuç bulunamadı.</p>
          <p className="text-sm mt-1">Başka bir terim deneyin.</p>
        </>
      ) : (
        <p>Bu kategoride henüz ürün yok.</p>
      )}
    </div>
  );
}
