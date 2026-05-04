import { useQuery } from '@tanstack/react-query';
import { FolderTree, UtensilsCrossed, CheckCircle2, Sparkles, BadgePlus, ChefHat } from 'lucide-react';
import { api } from '../../services/api';
import type { DashboardStats } from '../../types';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => (await api.get<DashboardStats>('/admin/dashboard')).data,
  });

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-primary">Dashboard</h1>
        <p className="text-sm text-brand-muted">Menünün genel durumu</p>
      </header>

      {isLoading || !data ? (
        <div className="text-brand-muted">Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card icon={<FolderTree className="h-5 w-5" />} label="Kategori" value={data.categoryCount} />
          <Card icon={<UtensilsCrossed className="h-5 w-5" />} label="Toplam Ürün" value={data.productCount} />
          <Card icon={<CheckCircle2 className="h-5 w-5" />} label="Aktif Ürün" value={data.activeProductCount} />
          <Card icon={<Sparkles className="h-5 w-5" />} label="Popüler" value={data.popularCount} />
          <Card icon={<BadgePlus className="h-5 w-5" />} label="Yeni" value={data.newCount} />
          <Card icon={<ChefHat className="h-5 w-5" />} label="Şefin Önerisi" value={data.recommendedCount} />
        </div>
      )}
    </div>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-4 sm:p-5 shadow-card">
      <div className="flex items-center justify-between text-brand-muted text-xs uppercase tracking-wider">
        <span>{label}</span>
        <span className="text-brand-primary">{icon}</span>
      </div>
      <div className="mt-2 text-3xl font-bold text-brand-text">{value}</div>
    </div>
  );
}
