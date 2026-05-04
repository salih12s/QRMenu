import type { Setting } from '../types';

export function PublicLayout({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings?: Setting | null;
}) {
  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <main>{children}</main>
      <footer className="border-t border-brand-border mt-16">
        <div className="max-w-5xl mx-auto px-5 py-8 text-center text-xs text-brand-muted space-y-1">
          {settings?.address && <div>{settings.address}</div>}
          {settings?.phone && <div>{settings.phone}</div>}
          <div className="pt-2">© {new Date().getFullYear()} {settings?.cafeName ?? "Uğur'um Cafe"}</div>
        </div>
      </footer>
    </div>
  );
}
