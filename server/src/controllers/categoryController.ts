import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { categoryService } from '../services/categoryService';

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(140).optional(),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().min(1).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const categoryController = {
  async listPublic(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await categoryService.listPublic());
    } catch (e) {
      next(e);
    }
  },
  async listAll(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await categoryService.listAll());
    } catch (e) {
      next(e);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await categoryService.create(req.body));
    } catch (e) {
      next(e);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      res.json(await categoryService.update(id, req.body));
    } catch (e) {
      next(e);
    }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      res.json(await categoryService.remove(id));
    } catch (e) {
      next(e);
    }
  },
};
