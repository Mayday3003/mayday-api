import { Prisma } from '@prisma/client';
import { AppError } from '../../application/errors/app.error.js';
import { BadRequestError } from '../../application/errors/bad-request.error.js';
import { ConflictError } from '../../application/errors/conflict.error.js';
import { NotFoundError } from '../../application/errors/not-found.error.js';

/**
 * Traduce los errores conocidos de Prisma a errores de la aplicación, para que Prisma
 * no salga de infrastructure/ y el cliente nunca vea nombres internos de la base de datos.
 * Devuelve null si el error no es de Prisma o no tiene traducción.
 */
export function translatePrismaError(err: unknown): AppError | null {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return null;
  switch (err.code) {
    case 'P2002': // Unique constraint failed
      return new ConflictError('Conflicto: Ya existe un registro con esos datos únicos');
    case 'P2003': // Foreign key constraint failed (la referencia no existe)
      return new BadRequestError('La referencia enviada no existe');
    case 'P2025': // Record not found
      return new NotFoundError('El registro solicitado no fue encontrado en la base de datos');
    default:
      return null;
  }
}
