import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/entities/errors.js';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Errores personalizados de la aplicación (AppError: 400, 401, 403, 404, 409)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  // 2. Errores conocidos de Prisma (evitar fugas de stack trace o nombres internos de base de datos)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint failed
    if (err.code === 'P2002') {
      res.status(409).json({
        error: {
          message: 'Conflicto: Ya existe un registro con esos datos únicos',
          statusCode: 409,
        },
      });
      return;
    }

    // P2025: Record not found
    if (err.code === 'P2025') {
      res.status(404).json({
        error: {
          message: 'El registro solicitado no fue encontrado en la base de datos',
          statusCode: 404,
        },
      });
      return;
    }
  }

  // 3. Error interno del servidor (500) sin stack trace expuesto
  console.error('💥 Error no controlado:', err);

  res.status(500).json({
    error: {
      message: 'Ocurrió un error interno en el servidor. Inténtalo más tarde.',
      statusCode: 500,
    },
  });
}
