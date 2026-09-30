import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../infrastructure/services/security.js';
import { UnauthorizedError, ForbiddenError } from '../../domain/entities/errors.js';
import { UserRole } from '../../domain/entities/index.js';

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
    const payload = TokenService.verify(token);
    req.user = {
      id: payload.id,
      role: payload.role,
    };
    next();
  } catch (error) {
    throw new UnauthorizedError('Token inválido o expirado. Por favor ingresa nuevamente.');
  }
}

/**
 * Middleware de Autorización por Rol
 * Verifica que el usuario autenticado tenga el rol requerido (ej: 'admin').
 * Si no tiene el rol, responde 403 Forbidden.
 */
export function requireRole(allowedRoles: UserRole | UserRole[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Acceso denegado: no tienes permisos de administrador para realizar esta acción.');
    }

    next();
  };
}
