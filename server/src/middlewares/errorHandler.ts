import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid request payload',
      details: err.flatten(),
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.name || 'Error',
      message: err.message,
      details: err.details,
    });
  }
  // Multer file size / fileFilter errors carry a `code`
  const anyErr = err as { code?: string; message?: string; status?: number };
  if (anyErr?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'UploadError', message: 'File too large (max 5MB).' });
  }
  if (anyErr?.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: 'UploadError', message: anyErr.message });
  }

  console.error('[unhandled error]', err);
  return res.status(500).json({ error: 'InternalServerError', message: 'Something went wrong.' });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'NotFound', message: 'Route not found.' });
}
