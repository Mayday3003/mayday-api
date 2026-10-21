import { validate, type ValidationError } from 'class-validator';
import { BadRequestError } from '../../application/errors/bad-request.error.js';

// Ejecuta class-validator y, si hay errores, lanza 400 con el primer mensaje de cada campo
export async function validateOrThrow(dto: object): Promise<void> {
  const errors: ValidationError[] = await validate(dto, { forbidUnknownValues: true });
  if (errors.length === 0) return;

  const fields: Record<string, string> = {};
  for (const error of errors) {
    const messages = Object.values(error.constraints ?? {});
    fields[error.property] = messages[0] ?? 'Valor inválido';
  }
  throw new BadRequestError('Error en los datos enviados', fields);
}
