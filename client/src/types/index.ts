export type Role = 'ADMIN' | 'STAFF';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  price: string; // Prisma Decimal serializes as string
  imageUrl: string | null;
  isActive: boolean;
  isPopular: boolean;
  isNew: boolean;
  isRecommended: boolean;
  allergenInfo: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
}

export interface Setting {
  id: number;
  cafeName: string;
  slogan: string | null;
  logoUrl: string | null;
  phone: string | null;
  address: string | null;
  instagramUrl: string | null;
  themePrimaryColor: string;
  themeBackgroundColor: string;
  themeCardColor: string;
  themeTextColor: string;
  themeMutedColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}

export interface MenuResponse {
  settings: Setting;
  categories: CategoryWithProducts[];
}

export interface DashboardStats {
  categoryCount: number;
  productCount: number;
  activeProductCount: number;
  popularCount: number;
  newCount: number;
  recommendedCount: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
