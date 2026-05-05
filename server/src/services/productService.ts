import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { HttpError } from '../middlewares/errorHandler';
import { slugify } from '../utils/slugify';

export interface ProductInput {
  categoryId: number;
  name: string;
  description?: string | null;
  price?: number | null;
  imageUrl?: string | null;
  isActive?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  isRecommended?: boolean;
  allergenInfo?: string | null;
  sortOrder?: number;
  slug?: string;
}

const PRODUCT_INCLUDE = {
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductInclude;

export const productService = {
  listPublic() {
    return prisma.product.findMany({
      where: { isActive: true, category: { isActive: true } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: PRODUCT_INCLUDE,
    });
  },

  listAll() {
    return prisma.product.findMany({
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      include: PRODUCT_INCLUDE,
    });
  },

  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_INCLUDE,
    });
    if (!product || !product.isActive) throw new HttpError(404, 'Product not found');
    return product;
  },

  async create(input: ProductInput) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) throw new HttpError(400, 'Invalid categoryId');

    const slug = (input.slug && slugify(input.slug)) || slugify(input.name);
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) throw new HttpError(409, 'A product with this slug already exists');

    return prisma.product.create({
      data: {
        categoryId: input.categoryId,
        name: input.name,
        slug,
        description: input.description ?? null,
        price:
          input.price === null || input.price === undefined
            ? null
            : new Prisma.Decimal(input.price),
        imageUrl: input.imageUrl ?? null,
        isActive: input.isActive ?? true,
        isPopular: input.isPopular ?? false,
        isNew: input.isNew ?? false,
        isRecommended: input.isRecommended ?? false,
        allergenInfo: input.allergenInfo ?? null,
        sortOrder: input.sortOrder ?? 0,
      },
      include: PRODUCT_INCLUDE,
    });
  },

  async update(id: number, input: Partial<ProductInput>) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, 'Product not found');

    if (input.categoryId && input.categoryId !== existing.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: input.categoryId } });
      if (!cat) throw new HttpError(400, 'Invalid categoryId');
    }

    let slug = existing.slug;
    if (input.slug) slug = slugify(input.slug);
    else if (input.name && input.name !== existing.name) slug = slugify(input.name);

    if (slug !== existing.slug) {
      const conflict = await prisma.product.findUnique({ where: { slug } });
      if (conflict) throw new HttpError(409, 'A product with this slug already exists');
    }

    return prisma.product.update({
      where: { id },
      data: {
        categoryId: input.categoryId ?? existing.categoryId,
        name: input.name ?? existing.name,
        slug,
        description: input.description ?? existing.description,
        price:
          input.price === undefined
            ? existing.price
            : input.price === null
              ? null
              : new Prisma.Decimal(input.price),
        imageUrl: input.imageUrl ?? existing.imageUrl,
        isActive: input.isActive ?? existing.isActive,
        isPopular: input.isPopular ?? existing.isPopular,
        isNew: input.isNew ?? existing.isNew,
        isRecommended: input.isRecommended ?? existing.isRecommended,
        allergenInfo: input.allergenInfo ?? existing.allergenInfo,
        sortOrder: input.sortOrder ?? existing.sortOrder,
      },
      include: PRODUCT_INCLUDE,
    });
  },

  async remove(id: number) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, 'Product not found');
    await prisma.product.delete({ where: { id } });
    return { success: true };
  },
};
