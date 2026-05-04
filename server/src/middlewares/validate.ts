import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate<T>(schema: ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(result.error);
    }
    // attach parsed data
    (req as Request & { validated?: unknown }).validated = result.data;
    if (source === 'body') req.body = result.data;
    return next();
  };
}
