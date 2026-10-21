import { AppError } from './app.error.js';

// 403: hay sesión, pero el rol no tiene permiso
export class ForbiddenError extends AppError {
  constructor(message: string = 'No tienes permisos para realizar esta acción') {
    super(message, 403);
  }
}
