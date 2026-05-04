import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { MenuResponse, Product } from '../types';

export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const { data } = await api.get<MenuResponse>('/menu');
      return data;
    },
    staleTime: 60_000,
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${slug}`);
      return data;
    },
  });
}
