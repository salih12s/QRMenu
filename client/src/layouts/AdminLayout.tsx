import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderTree, UtensilsCrossed, Settings, LogOut, Coffee, QrCode } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/categories', label: 'Kategoriler', icon: FolderTree },
  { to: '/admin/products', label: 'Ürünler', icon: UtensilsCrossed },
  { to: '/admin/qr', label: 'QR Menü', icon: QrCode },
  { to: '/admin/settings', label: 'Ayarlar', icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const onLogout = () => {
    logout();
    nav('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-brand-card border-b border-brand-border">
        <div className="flex items-center gap-2">
          <Coffee className="h-5 w-5 text-brand-primary" />
          <span className="font-display font-bold text-brand-primary">Uğur'um Admin</span>
        </div>
        <button
          onClick={onLogout}
          className="text-sm text-brand-muted hover:text-brand-primary"
          type="button"
        >
          Çıkış
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen sticky top-0 border-r border-brand-border bg-brand-card">
          <div className="px-5 py-5 flex items-center gap-2 border-b border-brand-border">
            <div className="h-9 w-9 rounded-full bg-brand-background grid place-items-center ring-1 ring-brand-primary/40">
              <Coffee className="h-5 w-5 text-brand-primary" />
            </div>
            <div>
              <div className="font-display font-bold text-brand-primary leading-none">Uğur'um Cafe</div>
              <div className="text-[11px] text-brand-muted mt-1">Admin Panel</div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition border',
                    isActive
                      ? 'bg-brand-primary text-black border-brand-primary'
                      : 'text-brand-text border-transparent hover:bg-[var(--color-card-2)] hover:border-brand-border',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t border-brand-border space-y-2">
            {user && (
              <div className="text-xs text-brand-muted px-2">
                <div className="text-brand-text font-medium truncate">{user.name}</div>
                <div className="truncate">{user.email}</div>
              </div>
            )}
            <button
              onClick={onLogout}
              type="button"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-brand-border text-sm text-brand-text hover:border-brand-primary/60 hover:text-brand-primary"
            >
              <LogOut className="h-4 w-4" /> Çıkış yap
            </button>
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 bg-brand-card border-t border-brand-border">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center py-2 text-[11px]',
                  isActive ? 'text-brand-primary' : 'text-brand-muted',
                )
              }
            >
              <item.icon className="h-5 w-5 mb-0.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Main */}
        <main className="flex-1 min-w-0 pb-24 lg:pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
