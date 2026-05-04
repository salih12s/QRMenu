import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Coffee, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@ugurumcafe.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      nav('/admin/dashboard', { replace: true });
    } catch (err) {
      const anyErr = err as { response?: { data?: { message?: string } } };
      setError(anyErr.response?.data?.message ?? 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-brand-background px-4">
      <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-2xl shadow-glow p-7">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-16 w-16 rounded-full bg-brand-background grid place-items-center ring-2 ring-brand-primary/40 mb-3 overflow-hidden">
            <img
              src="/logo.jpeg"
              alt="Uğur'um Cafe"
              className="h-full w-full object-cover"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.style.display = 'none';
                const fallback = img.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="hidden h-full w-full items-center justify-center">
              <Coffee className="h-7 w-7 text-brand-primary" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-primary">Uğur'um Cafe</h1>
          <p className="text-xs text-brand-muted tracking-widest uppercase mt-1">Admin Panel</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="E-posta">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-brand-background border border-brand-border text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </Field>
          <Field label="Şifre">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-brand-background border border-brand-border text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </Field>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-primary text-black font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-brand-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
