import { IsUUID } from 'class-validator';
import { validateOrThrow } from './validate.js';

// Params con :id. Un id que no es UUID responde 400 antes de llegar a Prisma
export class IdParamDto {
  @IsUUID('all', { message: 'El id debe ser un UUID válido' })
  id: string;

  constructor(params: Record<string, unknown>) {
    this.id = params['id'] as string;
  }

  validateDto(): Promise<void> {
    return validateOrThrow(this);
  }
}
