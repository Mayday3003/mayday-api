import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../infrastructure/services/jwt.service.js';
import { UnauthorizedError } from '../../application/errors/unauthorized.error.js';
import type { UserRole } from '../../domain/models/User.js';

const jwtService = new JwtService();

// Extender la interfaz Request de Express para adjuntar el usuario decodificado
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Middleware centralizado de Autenticación
 * Lee Authorization: Bearer <token>, lo verifica criptográficamente
 * y deja req.user = { id, role } disponible para los siguientes middlewares y controladores.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError('Token no proporcionado. Inicia sesión para continuar.');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new UnauthorizedError('Formato de autorización inválido. Usa Bearer <token>.');
  }

  const token = parts[1];

  try {
    const payload = jwtService.verify(token);
    req.user = {
      id: payload.id,
      role: payload.role,
    };
    next();
  } catch (error) {
    throw new UnauthorizedError('Token inválido o expirado. Por favor ingresa nuevamente.');
  }
}
