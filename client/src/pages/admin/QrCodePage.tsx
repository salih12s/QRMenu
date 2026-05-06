import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, Link as LinkIcon, RefreshCw, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import type { Setting } from '../../types';
import { resolveImageUrl } from '../../utils/format';

const FALLBACK_LOGO = '/logo.jpeg';
const LS_KEY = 'qrMenuUrl';

export function QrCodePage() {
  const { data: settings } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await api.get<Setting>('/admin/settings')).data,
  });

  // Public menü URL'i (QR'ın yönlendireceği adres).
  // Unicode (IDN) korunur, böylece QR üzerinde "https://uğurcafe.com/" görünür.
  const defaultUrl = useMemo(() => {
    const envUrl = (import.meta.env.VITE_PUBLIC_MENU_URL as string | undefined)?.trim();
    const raw = envUrl || (typeof window !== 'undefined' ? window.location.origin + '/' : '');
    return normalizeDisplayUrl(raw);
  }, []);

  // localStorage'da kullanıcının daha önce kaydettiği URL varsa onu yükle
  const [url, setUrl] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    const saved = window.localStorage.getItem(LS_KEY);
    return saved && saved.trim().length > 0 ? saved : '';
  });

  // İlk açılışta state boşsa default URL'yi yerleştir
  useEffect(() => {
    if (!url && defaultUrl) setUrl(defaultUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultUrl]);
  const [size, setSize] = useState<number>(512);
  const [withLogo, setWithLogo] = useState(true);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [fgColor, setFgColor] = useState('#0F0F0F');

  const qrRef = useRef<HTMLDivElement | null>(null);
  const cafeName = settings?.cafeName ?? "Uğur'um Cafe";
  const logoSrc = resolveImageUrl(settings?.logoUrl) ?? FALLBACK_LOGO;

  const getCanvas = (): HTMLCanvasElement | null =>
    qrRef.current?.querySelector('canvas') ?? null;

  const handleDownload = () => {
    const canvas = getCanvas();
    if (!canvas) {
      toast.error('QR oluşturulamadı');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${slugifyName(cafeName)}-qr-menu.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('QR indirildi');
  };

  const handlePrint = () => {
    const canvas = getCanvas();
    if (!canvas) {
      toast.error('QR oluşturulamadı');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    const html = `<!doctype html><html><head><meta charset="utf-8"/>
<title>${escapeHtml(cafeName)} — QR Menü</title>
<style>
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:#fff;color:#0F0F0F;font-family:system-ui,sans-serif;}
  .sheet{width:100%;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
  .card{width:360px;max-width:100%;text-align:center;border:2px solid #0F0F0F;border-radius:24px;padding:28px 24px;}
  .title{font-family:Georgia,serif;font-size:28px;font-weight:700;margin:0 0 4px}
  .sub{font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#555;margin:0 0 16px}
  img.qr{width:300px;height:300px;display:block;margin:8px auto}
  .scan{font-size:14px;margin-top:12px}
  @media print { @page { margin: 12mm; } .sheet{min-height:auto} }
</style></head><body>
<div class="sheet"><div class="card">
  <p class="title">${escapeHtml(cafeName)}</p>
  <p class="sub">QR Menü</p>
  <img id="qr" class="qr" src="${dataUrl}" alt="QR" />
  <p class="scan">Telefon kameranızla okutun</p>
</div></div>
<script>
  (function(){
    var img = document.getElementById('qr');
    function go(){ try { window.focus(); window.print(); } catch(e) {} }
    if (img && !img.complete) { img.onload = function(){ setTimeout(go, 150); }; }
    else { setTimeout(go, 150); }
  })();
<\/script>
</body></html>`;

    // 1) Önce yeni pencere dene
    const w = window.open('', '_blank', 'noopener,noreferrer,width=480,height=720');
    if (w && w.document) {
      w.document.open();
      w.document.write(html);
      w.document.close();
      return;
    }

    // 2) Pop-up engellendiyse: gizli iframe ile yazdır (her taraycıda çalışır)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const idoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!idoc) {
      toast.error('Yazdırma başlatılamadı');
      iframe.remove();
      return;
    }
    idoc.open();
    idoc.write(html);
    idoc.close();
    // iframe içindeki script print'i tetikleyecek; sonra temizle
    setTimeout(() => {
      try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); } catch {}
    }, 400);
    setTimeout(() => iframe.remove(), 60_000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Bağlantı kopyalandı');
    } catch {
      toast.error('Kopyalanamadı');
    }
  };

  const handleSaveUrl = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error('URL boş olamaz');
      return;
    }
    const normalized = normalizeDisplayUrl(trimmed);
    setUrl(normalized);
    try {
      window.localStorage.setItem(LS_KEY, normalized);
      toast.success('URL kaydedildi');
    } catch {
      toast.error('Kaydedilemedi');
    }
  };

  const handleResetUrl = () => {
    setUrl(defaultUrl);
    try {
      window.localStorage.removeItem(LS_KEY);
    } catch {
      // ignore
    }
    toast.success('Varsayılana dönüldü');
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-primary">QR Menü</h1>
        <p className="text-sm text-brand-muted">
          Masalarınıza koyacağınız QR kodu oluşturun. Müşteriler okuttuğunda menü sayfasına yönlendirilir.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings panel */}
        <section className="bg-brand-card border border-brand-border rounded-2xl p-5 space-y-4">
          <h2 className="font-display font-bold text-brand-primary">Ayarlar</h2>

          <Field label="Menü URL'i">
            <div className="flex gap-2">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-brand-background border border-brand-border text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={handleSaveUrl}
                title="Kaydet"
                className="px-3 py-2.5 rounded-xl bg-brand-primary text-black font-semibold hover:opacity-90 inline-flex items-center gap-1"
              >
                <Save className="h-4 w-4" /> Kaydet
              </button>
              <button
                type="button"
                onClick={handleResetUrl}
                title="Varsayılana dön"
                className="px-3 py-2.5 rounded-xl border border-brand-border text-brand-text hover:border-brand-primary/60 hover:text-brand-primary"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                title="Kopyala"
                className="px-3 py-2.5 rounded-xl border border-brand-border text-brand-text hover:border-brand-primary/60 hover:text-brand-primary"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-brand-muted mt-1.5">
              Kafenizin gerçek alan adını yazıp Kaydet'e basın. Taraycıda hatırlanır.
            </p>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <ColorField label="Arka plan" value={bgColor} onChange={setBgColor} />
            <ColorField label="QR rengi" value={fgColor} onChange={setFgColor} />
          </div>

          <Field label={`Boyut: ${size}px`}>
            <input
              type="range"
              min={256}
              max={1024}
              step={32}
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value, 10))}
              className="w-full accent-[var(--color-primary)]"
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-brand-text">
            <input
              type="checkbox"
              checked={withLogo}
              onChange={(e) => setWithLogo(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            Ortada logo göster
          </label>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-black font-semibold hover:opacity-90"
            >
              <Download className="h-4 w-4" /> PNG indir
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-border text-brand-text hover:border-brand-primary/60 hover:text-brand-primary"
            >
              <Printer className="h-4 w-4" /> Yazdır
            </button>
          </div>
        </section>

        {/* Preview */}
        <section className="bg-brand-card border border-brand-border rounded-2xl p-5">
          <h2 className="font-display font-bold text-brand-primary mb-4">Önizleme</h2>
          <div className="flex justify-center">
            <div
              ref={qrRef}
              className="rounded-2xl border-2 border-dashed border-brand-border p-4"
              style={{ background: bgColor }}
            >
              {url ? (
                <QRCodeCanvas
                  value={url}
                  size={Math.min(size, 360)}
                  bgColor={bgColor}
                  fgColor={fgColor}
                  level="H"
                  includeMargin
                  imageSettings={
                    withLogo
                      ? {
                          src: logoSrc,
                          height: Math.round(Math.min(size, 360) * 0.18),
                          width: Math.round(Math.min(size, 360) * 0.18),
                          excavate: true,
                        }
                      : undefined
                  }
                />
              ) : (
                <div className="text-brand-muted text-sm p-10">URL girin</div>
              )}
            </div>
          </div>
          <p className="text-center text-xs text-brand-muted mt-3 break-all">
            {url || '—'}
          </p>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs uppercase tracking-wider text-brand-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
    </div>
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
  return (
    <div>
      <span className="text-xs uppercase tracking-wider text-brand-muted">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 rounded-lg border border-brand-border bg-brand-background cursor-pointer"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl bg-brand-background border border-brand-border text-brand-text font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
        />
      </div>
    </div>
  );
}

function slugifyName(s: string): string {
  return s
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// IDN host'ları Unicode olarak korur, sadece eksik slash ekler.
// Örn. "https://uğurcafe.com" -> "https://uğurcafe.com/"
function normalizeDisplayUrl(input: string): string {
  if (!input) return input;
  let s = input.trim();
  // protokol yoksa https ekle
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  // çürt mi? sondaki boşlukları temizle, eksik slash'ı ekle
  if (!/\/$/.test(s) && !s.includes('?') && !s.includes('#')) s = s + '/';
  return s;
}
