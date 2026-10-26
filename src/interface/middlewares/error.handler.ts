import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import { AppError } from '../../application/errors/app.error.js';
import { BadRequestError } from '../../application/errors/bad-request.error.js';

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

  // 3. Errores conocidos de Prisma (evitar fugas de stack trace o nombres internos de base de datos)
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

    // P2003: Foreign key constraint failed (la referencia no existe)
    if (err.code === 'P2003') {
      res.status(400).json({
        error: {
          message: 'La referencia enviada no existe',
          statusCode: 400,
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

  // 4. Error interno del servidor (500) sin stack trace expuesto
  console.error('💥 Error no controlado:', err);

  res.status(500).json({
    error: {
      message: 'Ocurrió un error interno en el servidor. Inténtalo más tarde.',
      statusCode: 500,
    },
  });
}
