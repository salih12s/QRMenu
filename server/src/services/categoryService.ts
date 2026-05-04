import { prisma } from '../config/prisma';
import { HttpError } from '../middlewares/errorHandler';
import { slugify } from '../utils/slugify';

export interface CategoryInput {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  slug?: string;
}

export const categoryService = {
  listPublic() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  },

  listAll() {
    return prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  },

  async create(input: CategoryInput) {
    const slug = (input.slug && slugify(input.slug)) || slugify(input.name);
    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) throw new HttpError(409, 'A category with this slug already exists');

    return prisma.category.create({
      data: {
        name: input.name,
        slug,
        description: input.description ?? null,
        imageUrl: input.imageUrl ?? null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });
  },

  async update(id: number, input: Partial<CategoryInput>) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, 'Category not found');

    let slug = existing.slug;
    if (input.slug) slug = slugify(input.slug);
    else if (input.name && input.name !== existing.name) slug = slugify(input.name);

    if (slug !== existing.slug) {
      const conflict = await prisma.category.findUnique({ where: { slug } });
      if (conflict) throw new HttpError(409, 'A category with this slug already exists');
    }

    return prisma.category.update({
      where: { id },
      data: {
        name: input.name ?? existing.name,
        slug,
        description: input.description ?? existing.description,
        imageUrl: input.imageUrl ?? existing.imageUrl,
        sortOrder: input.sortOrder ?? existing.sortOrder,
        isActive: input.isActive ?? existing.isActive,
      },
    });
  },

  async remove(id: number) {
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new HttpError(
        409,
        'Cannot delete category with products. Move or delete its products first, or set it inactive.',
      );
    }
    await prisma.category.delete({ where: { id } });
    return { success: true };
  },
};
