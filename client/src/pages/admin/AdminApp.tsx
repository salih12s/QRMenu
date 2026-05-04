import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../hooks/useAuth';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { AdminLayout } from '../../layouts/AdminLayout';
import { LoginPage } from './LoginPage';
import { DashboardPage } from './DashboardPage';
import { CategoriesPage } from './CategoriesPage';
import { ProductsPage } from './ProductsPage';
import { SettingsPage } from './SettingsPage';
import { QrCodePage } from './QrCodePage';

export function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="qr" element={<QrCodePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
          path="*"
        />
      </Routes>
    </AuthProvider>
  );
}
