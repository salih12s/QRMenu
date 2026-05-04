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
  const base = ((import.meta.env.VITE_PUBLIC_BASE_URL as string) || 'http://localhost:5000').replace(/\/+$/, '');

  // Absolute URL: if it points to a stale localhost host, re-anchor the
  // /uploads path onto the current API base. Otherwise return as-is.
  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      const stale = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(u.hostname);
      if (stale && u.pathname.startsWith('/uploads/')) return `${base}${u.pathname}`;
      return url;
    } catch {
      return url;
    }
  }

  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}
