export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const NotFound = (m = 'Resource not found') => new AppError(404, m, 'NOT_FOUND');
export const BadRequest = (m = 'Bad request') => new AppError(400, m, 'BAD_REQUEST');
export const Unauthorized = (m = 'Authentication required') => new AppError(401, m, 'UNAUTHORIZED');
export const Forbidden = (m = 'Forbidden') => new AppError(403, m, 'FORBIDDEN');
export const Conflict = (m = 'Already exists') => new AppError(409, m, 'CONFLICT');
export const TooManyRequests = (m = 'Too many requests') => new AppError(429, m, 'RATE_LIMITED');
