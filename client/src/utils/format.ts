export function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
}

export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base = (import.meta.env.VITE_PUBLIC_BASE_URL as string) || 'http://localhost:5000';
  return `${base.replace(/\/+$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
}
