import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import type { Setting } from '../../types';
import { applyTheme } from '../../theme/applyTheme';
import { FieldLabel, inputCls, PrimaryButton } from '../../components/admin/FormFields';
import { ImageUpload } from '../../components/admin/ImageUpload';

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const isHex = (v: string) => HEX.test(v);

export function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await api.get<Setting>('/admin/settings')).data,
  });

  const [form, setForm] = useState<Setting | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  // Live preview
  useEffect(() => {
    if (form) applyTheme(form);
  }, [form]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!form) return;
      const payload = {
        cafeName: form.cafeName,
        slogan: form.slogan,
        logoUrl: form.logoUrl,
        phone: form.phone,
        address: form.address,
        instagramUrl: form.instagramUrl || null,
        themePrimaryColor: form.themePrimaryColor,
        themeBackgroundColor: form.themeBackgroundColor,
        themeCardColor: form.themeCardColor,
        themeTextColor: form.themeTextColor,
        themeMutedColor: form.themeMutedColor,
      };
      await api.put('/admin/settings', payload);
    },
    onSuccess: () => {
      toast.success('Ayarlar kaydedildi');
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      qc.invalidateQueries({ queryKey: ['menu'] });
    },
    onError: (e) => {
      const anyErr = e as { response?: { data?: { message?: string } } };
      toast.error(anyErr.response?.data?.message ?? 'Kaydedilemedi');
    },
  });

  if (isLoading || !form) {
    return <div className="text-brand-muted">Yükleniyor...</div>;
  }

  const update = <K extends keyof Setting>(k: K, v: Setting[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-primary">Ayarlar</h1>
        <p className="text-sm text-brand-muted">Cafe bilgileri ve tema renkleri</p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMut.mutate();
        }}
        className="space-y-6"
      >
        {/* Cafe info */}
        <Section title="Cafe Bilgileri">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldLabel label="Cafe Adı">
              <input
                className={inputCls}
                value={form.cafeName}
                onChange={(e) => update('cafeName', e.target.value)}
                required
              />
            </FieldLabel>
            <FieldLabel label="Slogan">
              <input
                className={inputCls}
                value={form.slogan ?? ''}
                onChange={(e) => update('slogan', e.target.value)}
              />
            </FieldLabel>
            <FieldLabel label="Telefon">
              <input
                className={inputCls}
                value={form.phone ?? ''}
                onChange={(e) => update('phone', e.target.value)}
              />
            </FieldLabel>
            <FieldLabel label="Instagram URL">
              <input
                className={inputCls}
                value={form.instagramUrl ?? ''}
                onChange={(e) => update('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </FieldLabel>
            <div className="sm:col-span-2">
              <FieldLabel label="Adres">
                <textarea
                  className={inputCls}
                  rows={2}
                  value={form.address ?? ''}
                  onChange={(e) => update('address', e.target.value)}
                />
              </FieldLabel>
            </div>
          </div>

          <div className="mt-4">
            <ImageUpload
              value={form.logoUrl}
              onChange={(url) => update('logoUrl', url)}
              label="Logo"
            />
          </div>
        </Section>

        {/* Theme */}
        <Section title="Tema Renkleri">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ColorField
              label="Birincil (Vurgu)"
              value={form.themePrimaryColor}
              onChange={(v) => update('themePrimaryColor', v)}
            />
            <ColorField
              label="Arka plan"
              value={form.themeBackgroundColor}
              onChange={(v) => update('themeBackgroundColor', v)}
            />
            <ColorField
              label="Kart"
              value={form.themeCardColor}
              onChange={(v) => update('themeCardColor', v)}
            />
            <ColorField
              label="Yazı"
              value={form.themeTextColor}
              onChange={(v) => update('themeTextColor', v)}
            />
            <ColorField
              label="Soluk yazı"
              value={form.themeMutedColor}
              onChange={(v) => update('themeMutedColor', v)}
            />
          </div>
          <p className="text-xs text-brand-muted mt-3">
            Renkler kaydedildiğinde hem admin hem de public menü anında güncellenir.
          </p>
        </Section>

        <div className="flex justify-end">
          <PrimaryButton type="submit" disabled={saveMut.isPending}>
            {saveMut.isPending ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-brand-card border border-brand-border rounded-2xl p-5">
      <h2 className="font-display font-bold text-brand-primary mb-4">{title}</h2>
      {children}
    </section>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const valid = isHex(value);
  return (
    <div>
      <span className="text-xs uppercase tracking-wider text-brand-muted">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={valid ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 rounded-lg border border-brand-border bg-brand-background cursor-pointer"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} font-mono text-sm`}
          placeholder="#RRGGBB"
        />
      </div>
      {!valid && <p className="text-[11px] text-red-400 mt-1">Geçerli bir hex değeri girin (#RRGGBB).</p>}
    </div>
  );
}
