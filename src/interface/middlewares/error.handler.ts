import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError } from '../../application/errors/app.error.js';
import { BadRequestError } from '../../application/errors/bad-request.error.js';
import { translatePrismaError } from '../../infrastructure/repository/prisma-errors.js';

// 404 para cualquier ruta que no exista
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: {
      message: 'Ruta no encontrada',
      statusCode: 404,
    },
  });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Los errores conocidos de Prisma llegan ya traducidos a errores de la aplicación
  const prismaError = translatePrismaError(err);
  if (prismaError) err = prismaError;

  // 1. Errores personalizados de la aplicación (400, 401, 403, 404, 409)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
        ...(err instanceof BadRequestError && err.fields && { fields: err.fields }),
      },
    });
    return;
  }

  // Archivo demasiado grande u otros errores de multer
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'La imagen no puede superar 5 MB' : 'Archivo inválido';
    res.status(400).json({
      error: {
        message,
        statusCode: 400,
        fields: { image: message },
      },
    });
    return;
  }

  // 2. Body con JSON mal formado (lo lanza express.json)
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: {
        message: 'El cuerpo de la petición no es un JSON válido',
        statusCode: 400,
      },
    });
    return;
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
