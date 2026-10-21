import { AppError } from './app.error.js';

// 401: no hay sesión válida (sin token, token inválido o credenciales incorrectas)
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Credenciales inválidas o no autorizado') {
    super(message, 401);
  }
}
