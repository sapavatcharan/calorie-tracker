import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      validated: { body?: unknown; query?: unknown; params?: unknown };
    }
  }
}

export const validate =
  (schemas: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.validated = {
        body: schemas.body ? schemas.body.parse(req.body) : undefined,
        query: schemas.query ? schemas.query.parse(req.query) : undefined,
        params: schemas.params ? schemas.params.parse(req.params) : undefined,
      };
      next();
    } catch (err) {
      next(err);
    }
  };
