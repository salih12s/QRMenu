import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { settingService } from '../services/settingService';

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const settingUpdateSchema = z.object({
  cafeName: z.string().min(1).max(120).optional(),
  slogan: z.string().max(160).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  themePrimaryColor: z.string().regex(HEX).optional(),
  themeBackgroundColor: z.string().regex(HEX).optional(),
  themeCardColor: z.string().regex(HEX).optional(),
  themeTextColor: z.string().regex(HEX).optional(),
  themeMutedColor: z.string().regex(HEX).optional(),
});

export const settingController = {
  async get(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await settingService.get());
    } catch (e) {
      next(e);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await settingService.update(req.body));
    } catch (e) {
      next(e);
    }
  },
};
