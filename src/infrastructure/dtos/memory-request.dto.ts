import { IsArray, IsDateString, IsIn, IsOptional, IsString, Length, MinLength } from 'class-validator';
import type { ExperienceCategory } from '../../domain/models/Experience.js';
import type { CreateMemoryRequestDto } from '../../domain/models/MemoryRequest.js';
import { validateOrThrow } from './validate.js';

// Body de POST /api/propuestas. El autor (userId) NO es parte del DTO: sale del token
export class CreateMemoryRequestBodyDto implements CreateMemoryRequestDto {
  @IsString({ message: 'El título es obligatorio' })
  @Length(3, 150, { message: 'El título debe tener entre 3 y 150 caracteres' })
  title: string;

  @IsIn(['viaje', 'situacion', 'experiencia'], { message: 'El tipo debe ser: viaje, situacion o experiencia' })
  type: ExperienceCategory;

  @IsString({ message: 'La descripción es obligatoria' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  description: string;

  @IsOptional()
  @IsString({ message: 'La URL de la imagen debe ser texto' })
  imageUrl?: string | null;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener formato AAAA-MM-DD' })
  date?: string | null;

  @IsOptional()
  @IsArray({ message: 'Los participantes deben ser una lista' })
  @IsString({ each: true, message: 'Cada participante debe ser texto' })
  participants?: string[];

  constructor(payload: Record<string, unknown>) {
    this.title = typeof payload['title'] === 'string' ? payload['title'].trim() : (payload['title'] as string);
    this.type = payload['type'] as ExperienceCategory;
    this.description = typeof payload['description'] === 'string' ? payload['description'].trim() : (payload['description'] as string);
    this.imageUrl = payload['imageUrl'] as string | null | undefined;
    this.date = payload['date'] as string | null | undefined;
    this.participants = payload['participants'] as string[] | undefined;
  }

  validateDto(): Promise<void> {
    return validateOrThrow(this);
  }
}
