import { AppError } from './app.error.js';

// 400: datos de entrada inválidos. `fields` lleva el mensaje de cada campo para mostrarlo en el formulario
export class BadRequestError extends AppError {
  public readonly fields?: Record<string, string>;

  constructor(message: string = 'Datos inválidos', fields?: Record<string, string>) {
    super(message, 400);
    this.fields = fields;
  }
}
