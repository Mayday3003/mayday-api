import { AppError } from './app.error.js';

// 409: la operación choca con un dato que ya existe (por ejemplo, un email repetido)
export class ConflictError extends AppError {
  constructor(message: string = 'El recurso ya existe') {
    super(message, 409);
  }
}
