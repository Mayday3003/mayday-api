import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../application/errors/unauthorized.error.js';
import { ForbiddenError } from '../../application/errors/forbidden.error.js';
import type { UserRole } from '../../domain/models/User.js';

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

// Alias que pide el enunciado: se usa siempre después de authenticate
export const soloAdmin = requireRole('admin');
