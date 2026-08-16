import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, Unauthorized } from '../core/errors';
import { config } from '../config';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw Unauthorized('Missing or malformed Authorization header');
    const { userId } = jwt.verify(header.slice(7), config.JWT_SECRET) as { userId: string };
    req.userId = userId;
    next();
  } catch (e: unknown) {
    if (e instanceof AppError) return next(e);
    const name = (e as { name?: string })?.name;
    if (name === 'TokenExpiredError') return next(new AppError(401, 'Token expired', 'TOKEN_EXPIRED'));
    return next(new AppError(401, 'Invalid token', 'INVALID_TOKEN'));
  }
};
