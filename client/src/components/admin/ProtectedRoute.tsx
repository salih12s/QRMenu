import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  if (!isReady) {
    return <div className="min-h-screen grid place-items-center text-brand-muted">Yükleniyor...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
