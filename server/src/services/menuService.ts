import { prisma } from '../config/prisma';
import { settingService } from './settingService';

export const menuService = {
  async getPublicMenu() {
    const [settings, categories] = await Promise.all([
      settingService.get(),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          products: {
            where: { isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          },
        },
      }),
    ]);

    return { settings, categories };
  },

  async getDashboardStats() {
    const [categoryCount, productCount, activeProductCount, popularCount, newCount, recommendedCount] =
      await Promise.all([
        prisma.category.count(),
        prisma.product.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.count({ where: { isPopular: true } }),
        prisma.product.count({ where: { isNew: true } }),
        prisma.product.count({ where: { isRecommended: true } }),
      ]);

    return {
      categoryCount,
      productCount,
      activeProductCount,
      popularCount,
      newCount,
      recommendedCount,
    };
  },
};
