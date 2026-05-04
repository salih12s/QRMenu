import { Request, Response, NextFunction } from 'express';
import { menuService } from '../services/menuService';
import { uploadService } from '../services/uploadService';
import { HttpError } from '../middlewares/errorHandler';

export const menuController = {
  async getMenu(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await menuService.getPublicMenu());
    } catch (e) {
      next(e);
    }
  },

  async getDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await menuService.getDashboardStats());
    } catch (e) {
      next(e);
    }
  },

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new HttpError(400, 'No file uploaded (field name: "file")');
      const result = await uploadService.handleUpload(req.file);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },
};
