import { Request, Response, NextFunction } from 'express';

export function loggerMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

  next();
}
