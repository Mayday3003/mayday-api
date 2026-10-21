import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { validateOrThrow } from './validate.js';

// Body de POST /api/interacciones. El userId NO es parte del DTO: sale del token
export class CreateInteractionBodyDto {
  @IsString({ message: 'El comentario es obligatorio' })
  @MinLength(3, { message: 'El recuerdo o comentario debe tener al menos 3 caracteres' })
  content: string;

  @IsString({ message: 'La experiencia es obligatoria' })
  @IsNotEmpty({ message: 'La experiencia es obligatoria' })
  experienceId: string;

  constructor(payload: Record<string, unknown>) {
    this.content = typeof payload['content'] === 'string' ? payload['content'].trim() : (payload['content'] as string);
    this.experienceId = payload['experienceId'] as string;
  }

  validateDto(): Promise<void> {
    return validateOrThrow(this);
  }
}
