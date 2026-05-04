import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import type { Category } from '../../types';
import { Modal } from '../../components/admin/Modal';
import { FieldLabel, inputCls, PrimaryButton, GhostButton, Switch } from '../../components/admin/FormFields';

interface FormState {
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

const empty: FormState = {
  name: '',
  description: '',
  sortOrder: 0,
  isActive: true,
};

export function CategoriesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => (await api.get<Category[]>('/admin/categories')).data,
  });

  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  const open = (c: Category | null) => {
    if (c) {
      setEditing(c);
      setCreating(false);
      setForm({
        name: c.name,
        description: c.description ?? '',
        sortOrder: c.sortOrder,
        isActive: c.isActive,
      });
    } else {
      setEditing(null);
      setCreating(true);
      setForm(empty);
    }
  };

  const close = () => {
    setEditing(null);
    setCreating(false);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description || null,
        imageUrl: null,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };
      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, payload);
      } else {
        await api.post('/admin/categories', payload);
      }
    },
    onSuccess: () => {
      toast.success('Kaydedildi');
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['menu'] });
      close();
    },
    onError: (e) => {
      const anyErr = e as { response?: { data?: { message?: string } } };
      toast.error(anyErr.response?.data?.message ?? 'Kaydedilemedi');
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      toast.success('Silindi');
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: (e) => {
      const anyErr = e as { response?: { data?: { message?: string } } };
      toast.error(anyErr.response?.data?.message ?? 'Silinemedi');
    },
  });

  const isOpen = creating || !!editing;

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-primary">Kategoriler</h1>
          <p className="text-sm text-brand-muted">Menü kategorilerini yönetin</p>
        </div>
        <PrimaryButton onClick={() => open(null)}>
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Yeni Kategori
          </span>
        </PrimaryButton>
      </header>

      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-brand-muted">Yükleniyor...</div>
        ) : !data || data.length === 0 ? (
          <div className="p-6 text-brand-muted">Henüz kategori yok.</div>
        ) : (
          <ul className="divide-y divide-brand-border">
            {data.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 sm:px-5 py-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-brand-text">{c.name}</div>
                  <div className="text-xs text-brand-muted truncate">/{c.slug} • sıra: {c.sortOrder}</div>
                </div>
                <span
                  className={
                    c.isActive
                      ? 'text-[10px] uppercase tracking-wider text-brand-primary border border-brand-primary/40 rounded-full px-2 py-0.5'
                      : 'text-[10px] uppercase tracking-wider text-brand-muted border border-brand-border rounded-full px-2 py-0.5'
                  }
                >
                  {c.isActive ? 'Aktif' : 'Pasif'}
                </span>
                <button
                  onClick={() => open(c)}
                  className="h-8 w-8 grid place-items-center rounded-lg hover:bg-[var(--color-card-2)] text-brand-text"
                  aria-label="Düzenle"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`"${c.name}" kategorisini silmek istediğinize emin misiniz?`)) {
                      deleteMut.mutate(c.id);
                    }
                  }}
                  className="h-8 w-8 grid place-items-center rounded-lg hover:bg-red-500/10 text-red-400"
                  aria-label="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={isOpen}
        onClose={close}
        title={editing ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMut.mutate();
          }}
          className="space-y-4"
        >
          <FieldLabel label="Ad">
            <input
              required
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </FieldLabel>

          <FieldLabel label="Açıklama">
            <textarea
              className={inputCls}
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </FieldLabel>

          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label="Sıralama">
              <input
                type="number"
                className={inputCls}
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              />
            </FieldLabel>
            <div className="flex items-end">
              <Switch
                checked={form.isActive}
                onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                label="Aktif"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <GhostButton onClick={close}>Vazgeç</GhostButton>
            <PrimaryButton type="submit" disabled={saveMut.isPending}>
              {saveMut.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
