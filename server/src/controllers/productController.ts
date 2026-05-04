import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { productService } from '../services/productService';

export const productCreateSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(180).optional(),
  description: z.string().max(1000).optional().nullable(),
  price: z.number().nonnegative(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  allergenInfo: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const productController = {
  async listPublic(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await productService.listPublic());
    } catch (e) {
      next(e);
    }
  },
  async listAll(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await productService.listAll());
    } catch (e) {
      next(e);
    }
  },
  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await productService.getBySlug(req.params.slug));
    } catch (e) {
      next(e);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await productService.create(req.body));
    } catch (e) {
      next(e);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      res.json(await productService.update(id, req.body));
    } catch (e) {
      next(e);
    }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      res.json(await productService.remove(id));
    } catch (e) {
      next(e);
    }
  },
};
