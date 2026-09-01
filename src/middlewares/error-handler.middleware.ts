import { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app-error';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  console.error('Erro inesperado:', error);

  res.status(500).json({ message: 'Erro interno do servidor' });
};
