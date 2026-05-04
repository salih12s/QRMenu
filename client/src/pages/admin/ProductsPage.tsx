import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import type { Category, Product } from '../../types';
import { Modal } from '../../components/admin/Modal';
import { FieldLabel, inputCls, PrimaryButton, GhostButton, Switch } from '../../components/admin/FormFields';
import { ImageUpload } from '../../components/admin/ImageUpload';
import { formatPrice, resolveImageUrl } from '../../utils/format';

interface FormState {
  categoryId: number | '';
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
  isActive: boolean;
  isPopular: boolean;
  isNew: boolean;
  isRecommended: boolean;
  allergenInfo: string;
  sortOrder: string; // string so input can be cleared
}

const empty: FormState = {
  categoryId: '',
  name: '',
  description: '',
  price: '',
  imageUrl: null,
  isActive: true,
  isPopular: false,
  isNew: false,
  isRecommended: false,
  allergenInfo: '',
  sortOrder: '',
};

export function ProductsPage() {
  const qc = useQueryClient();
  const products = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => (await api.get<Product[]>('/admin/products')).data,
  });
  const categories = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => (await api.get<Category[]>('/admin/categories')).data,
  });

  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [filterCat, setFilterCat] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  // Sort order conflict confirmation
  const [conflictInfo, setConflictInfo] = useState<{
    targetOrder: number;
    occupantName: string;
    direction: 'up' | 'down';
    affectedCount: number;
  } | null>(null);

  const open = (p: Product | null) => {
    if (p) {
      setEditing(p);
      setCreating(false);
      setForm({
        categoryId: p.categoryId,
        name: p.name,
        description: p.description ?? '',
        price: String(p.price),
        imageUrl: p.imageUrl,
        isActive: p.isActive,
        isPopular: p.isPopular,
        isNew: p.isNew,
        isRecommended: p.isRecommended,
        allergenInfo: p.allergenInfo ?? '',
        sortOrder: String(p.sortOrder),
      });
    } else {
      setEditing(null);
      setCreating(true);
      const firstCat = categories.data?.[0]?.id;
      setForm({ ...empty, categoryId: firstCat ?? '' });
    }
  };

  const close = () => {
    setEditing(null);
    setCreating(false);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      if (form.categoryId === '') throw new Error('Kategori seçin');
      const categoryId = Number(form.categoryId);
      const newOrder = form.sortOrder === '' ? 0 : Number(form.sortOrder);

      const payload = {
        categoryId,
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        isActive: form.isActive,
        isPopular: form.isPopular,
        isNew: form.isNew,
        isRecommended: form.isRecommended,
        allergenInfo: form.allergenInfo || null,
        sortOrder: newOrder,
      };

      if (editing) {
        // Detect sort-order conflict within the same category
        const oldOrder = editing.sortOrder;
        const sameCatProducts = (products.data ?? []).filter(
          (p) => p.categoryId === categoryId && p.id !== editing.id,
        );
        const conflict =
          newOrder !== oldOrder &&
          newOrder > 0 &&
          sameCatProducts.some((p) => p.sortOrder === newOrder);

        if (conflict) {
          // Compute affected items
          const direction: 'up' | 'down' = newOrder > oldOrder ? 'up' : 'down';
          const affected = sameCatProducts.filter((p) =>
            direction === 'up'
              ? p.sortOrder > oldOrder && p.sortOrder <= newOrder
              : p.sortOrder >= newOrder && p.sortOrder < oldOrder,
          );
          const occupant = sameCatProducts.find((p) => p.sortOrder === newOrder);

          // Show confirmation; defer actual save until user confirms
          setConflictInfo({
            targetOrder: newOrder,
            occupantName: occupant?.name ?? '',
            direction,
            affectedCount: affected.length,
          });
          // Throw a sentinel to abort current mutation; user re-triggers via confirm
          throw new Error('__CONFIRM_REQUIRED__');
        }

        await api.put(`/admin/products/${editing.id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
    },
    onSuccess: () => {
      toast.success('Kaydedildi');
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['menu'] });
      close();
    },
    onError: (e) => {
      const anyErr = e as { message?: string; response?: { data?: { message?: string } } };
      if (anyErr.message === '__CONFIRM_REQUIRED__') return; // Modal will handle next step
      toast.error(anyErr.response?.data?.message ?? 'Kaydedilemedi');
    },
  });

  // Runs the actual reorder + save after user confirms the swap
  const confirmReorderMut = useMutation({
    mutationFn: async () => {
      if (!editing || form.categoryId === '') return;
      const categoryId = Number(form.categoryId);
      const newOrder = form.sortOrder === '' ? 0 : Number(form.sortOrder);
      const oldOrder = editing.sortOrder;
      const direction: 'up' | 'down' = newOrder > oldOrder ? 'up' : 'down';

      const sameCatProducts = (products.data ?? []).filter(
        (p) => p.categoryId === categoryId && p.id !== editing.id,
      );
      const affected = sameCatProducts.filter((p) =>
        direction === 'up'
          ? p.sortOrder > oldOrder && p.sortOrder <= newOrder
          : p.sortOrder >= newOrder && p.sortOrder < oldOrder,
      );

      // Shift affected products one step toward the gap
      // (sequential to avoid race conditions)
      for (const p of affected) {
        const shifted = direction === 'up' ? p.sortOrder - 1 : p.sortOrder + 1;
        await api.put(`/admin/products/${p.id}`, {
          categoryId: p.categoryId,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          imageUrl: p.imageUrl,
          isActive: p.isActive,
          isPopular: p.isPopular,
          isNew: p.isNew,
          isRecommended: p.isRecommended,
          allergenInfo: p.allergenInfo,
          sortOrder: shifted,
        });
      }

      // Finally save the edited product at the new order
      await api.put(`/admin/products/${editing.id}`, {
        categoryId,
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        isActive: form.isActive,
        isPopular: form.isPopular,
        isNew: form.isNew,
        isRecommended: form.isRecommended,
        allergenInfo: form.allergenInfo || null,
        sortOrder: newOrder,
      });
    },
    onSuccess: () => {
      toast.success('Sıralama güncellendi');
      setConflictInfo(null);
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['menu'] });
      close();
    },
    onError: (e) => {
      const anyErr = e as { response?: { data?: { message?: string } } };
      toast.error(anyErr.response?.data?.message ?? 'Sıralama güncellenemedi');
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      toast.success('Silindi');
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['menu'] });
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr-TR');
    return (products.data ?? []).filter((p) => {
      if (filterCat !== 'all' && p.categoryId !== filterCat) return false;
      if (!q) return true;
      return (
        p.name.toLocaleLowerCase('tr-TR').includes(q) ||
        p.description?.toLocaleLowerCase('tr-TR').includes(q)
      );
    });
  }, [products.data, filterCat, search]);

  const isOpen = creating || !!editing;

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-primary">Ürünler</h1>
          <p className="text-sm text-brand-muted">Menü ürünlerini yönetin</p>
        </div>
        <PrimaryButton onClick={() => open(null)}>
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Yeni Ürün
          </span>
        </PrimaryButton>
      </header>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün ara..."
            className={`${inputCls} pl-9`}
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className={inputCls}
        >
          <option value="all">Tüm kategoriler</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
        {products.isLoading ? (
          <div className="p-6 text-brand-muted">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-brand-muted">Sonuç yok.</div>
        ) : (
          <ul className="divide-y divide-brand-border">
            {filtered.map((p) => {
              const img = resolveImageUrl(p.imageUrl);
              const cat = categories.data?.find((c) => c.id === p.categoryId);
              return (
                <li key={p.id} className="flex items-center gap-3 px-4 sm:px-5 py-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-[var(--color-card-2)] grid place-items-center flex-none">
                    {img ? (
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-brand-muted">No img</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-brand-text truncate">{p.name}</div>
                    <div className="text-xs text-brand-muted truncate">
                      {cat?.name ?? '—'} • {formatPrice(p.price)}
                      {p.isPopular && ' • Popüler'}
                      {p.isNew && ' • Yeni'}
                      {p.isRecommended && ' • Şefin Önerisi'}
                    </div>
                  </div>
                  <span
                    className={
                      p.isActive
                        ? 'text-[10px] uppercase tracking-wider text-brand-primary border border-brand-primary/40 rounded-full px-2 py-0.5'
                        : 'text-[10px] uppercase tracking-wider text-brand-muted border border-brand-border rounded-full px-2 py-0.5'
                    }
                  >
                    {p.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                  <button
                    onClick={() => open(p)}
                    className="h-8 w-8 grid place-items-center rounded-lg hover:bg-[var(--color-card-2)] text-brand-text"
                    aria-label="Düzenle"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${p.name}" ürününü silmek istediğinize emin misiniz?`)) {
                        deleteMut.mutate(p.id);
                      }
                    }}
                    className="h-8 w-8 grid place-items-center rounded-lg hover:bg-red-500/10 text-red-400"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal open={isOpen} onClose={close} title={editing ? 'Ürünü Düzenle' : 'Yeni Ürün'} size="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMut.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldLabel label="Ad">
              <input
                required
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </FieldLabel>

            <FieldLabel label="Kategori">
              <select
                required
                className={inputCls}
                value={form.categoryId}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    categoryId: e.target.value === '' ? '' : Number(e.target.value),
                  }))
                }
              >
                <option value="">Seçin...</option>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FieldLabel>
          </div>

          <FieldLabel label="Açıklama">
            <textarea
              rows={3}
              className={inputCls}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </FieldLabel>

          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label="Fiyat (₺)">
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className={inputCls}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </FieldLabel>
            <FieldLabel label="Sıralama">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                className={inputCls}
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                placeholder="Ör. 1"
              />
            </FieldLabel>
          </div>

          <ImageUpload
            value={form.imageUrl}
            onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            label="Ürün görseli"
          />

          <FieldLabel label="Alerjen bilgisi (opsiyonel)">
            <input
              className={inputCls}
              value={form.allergenInfo}
              onChange={(e) => setForm((f) => ({ ...f, allergenInfo: e.target.value }))}
            />
          </FieldLabel>

          <div className="grid grid-cols-2 gap-2">
            <Switch
              checked={form.isActive}
              onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              label="Aktif"
            />
            <Switch
              checked={form.isPopular}
              onChange={(v) => setForm((f) => ({ ...f, isPopular: v }))}
              label="Popüler"
            />
            <Switch
              checked={form.isNew}
              onChange={(v) => setForm((f) => ({ ...f, isNew: v }))}
              label="Yeni"
            />
            <Switch
              checked={form.isRecommended}
              onChange={(v) => setForm((f) => ({ ...f, isRecommended: v }))}
              label="Şefin Önerisi"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <GhostButton onClick={close}>Vazgeç</GhostButton>
            <PrimaryButton type="submit" disabled={saveMut.isPending}>
              {saveMut.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Sort order conflict confirmation */}
      <Modal
        open={!!conflictInfo}
        onClose={() => setConflictInfo(null)}
        title="Sıralamayı değiştir"
        size="md"
      >
        {conflictInfo && (
          <div className="space-y-4">
            <p className="text-sm text-brand-text">
              <span className="font-semibold text-brand-primary">{conflictInfo.targetOrder}.</span>{' '}
              sırada zaten{' '}
              <span className="font-semibold">"{conflictInfo.occupantName}"</span> ürünü var.
            </p>
            <p className="text-sm text-brand-muted">
              Onaylarsanız bu ürün <strong>{conflictInfo.targetOrder}</strong>. sıraya taşınır,
              aradaki <strong>{conflictInfo.affectedCount}</strong> ürün{' '}
              {conflictInfo.direction === 'up' ? 'bir üst' : 'bir alt'} sıraya kaydırılır.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <GhostButton onClick={() => setConflictInfo(null)}>Vazgeç</GhostButton>
              <PrimaryButton
                onClick={() => confirmReorderMut.mutate()}
                disabled={confirmReorderMut.isPending}
              >
                {confirmReorderMut.isPending ? 'Uygulanıyor...' : 'Evet, yer değiştir'}
              </PrimaryButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
