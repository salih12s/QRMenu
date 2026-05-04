import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { MenuPage } from './pages/MenuPage';

const AdminApp = lazy(() => import('./pages/admin/AdminApp').then((m) => ({ default: m.AdminApp })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<FullScreenLoader />}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--color-card)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          },
        }}
      />
    </QueryClientProvider>
  );
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen grid place-items-center text-brand-muted bg-brand-background">
      Yükleniyor...
    </div>
  );
}
