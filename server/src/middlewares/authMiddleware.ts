import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpError } from './errorHandler';

export interface AuthPayload {
  userId: number;
  role: 'ADMIN' | 'STAFF';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Missing or invalid Authorization header'));
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = payload;
    return next();
  } catch {
    return next(new HttpError(401, 'Invalid or expired token'));
  }
}

export function requireRole(...roles: AuthPayload['role'][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, 'Unauthorized'));
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Forbidden: insufficient role'));
    }
    return next();
  };
}
