import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import type { Category } from '../../types';

interface Props {
  categories: Category[];
  activeId: number | 'all';
  onSelect: (id: number | 'all') => void;
}

export function CategoryTabs({ categories, activeId, onSelect }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // Aktif sekme görünür değilse scroller'ı ona kaydır (mobil UX)
  useEffect(() => {
    const el = activeRef.current;
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    const elRect = el.getBoundingClientRect();
    const scRect = scroller.getBoundingClientRect();
    if (elRect.left < scRect.left || elRect.right > scRect.right) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeId]);

  return (
    <div className="sticky top-0 z-20 py-3 bg-brand-background/95 backdrop-blur border-b border-brand-border">
      <div
        ref={scrollerRef}
        className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          scrollSnapType: 'x proximity',
          overscrollBehaviorX: 'contain',
        }}
      >
        <Tab
          active={activeId === 'all'}
          onClick={() => onSelect('all')}
          activeRef={activeId === 'all' ? activeRef : undefined}
        >
          Tümü
        </Tab>
        {categories.map((c) => (
          <Tab
            key={c.id}
            active={activeId === c.id}
            onClick={() => onSelect(c.id)}
            activeRef={activeId === c.id ? activeRef : undefined}
          >
            {c.name}
          </Tab>
        ))}
        {/* Sondaki sekmenin tam görünmesini sağlamak için boşluk */}
        <span className="shrink-0 w-2" aria-hidden />
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
  activeRef,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeRef?: React.MutableRefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={activeRef}
      type="button"
      onClick={onClick}
      style={{ scrollSnapAlign: 'center' }}
      className={clsx(
        'shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition select-none',
        active
          ? 'bg-brand-primary text-black border-brand-primary shadow-card'
          : 'bg-brand-card text-brand-text border-brand-border hover:border-brand-primary/50 active:scale-95',
      )}
    >
      {children}
    </button>
  );
}
