import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as z.infer<typeof loginSchema>;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },
};
