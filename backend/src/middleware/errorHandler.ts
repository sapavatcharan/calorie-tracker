import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import { AppError } from '../core/errors';
import { isProd } from '../config';
import { logger } from '../core/logger';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 10MB)' : err.message;
    return res.status(400).json({ message, code: 'BAD_REQUEST' });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, code: err.code });
  }
  const code = (err as { code?: string })?.code;
  if (code === 'P2025') return res.status(404).json({ message: 'Resource not found', code: 'NOT_FOUND' });
  if (code === 'P2002') return res.status(409).json({ message: 'Already exists', code: 'CONFLICT' });

  logger.error('Unhandled error', err);
  return res.status(500).json({
    message: 'Internal server error',
    ...(!isProd && {
      detail: (err as { message?: string })?.message,
      stack: (err as { stack?: string })?.stack,
    }),
  });
};
