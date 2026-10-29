import { IsArray, IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { ExperienceCategory } from '../../domain/models/Experience.js';
import type { CreateMemoryRequestDto } from '../../domain/models/MemoryRequest.js';
import { validateOrThrow } from './validate.js';

// Body de POST /api/propuestas. El autor (userId) NO es parte del DTO: sale del token
export class CreateMemoryRequestBodyDto implements CreateMemoryRequestDto {
  // Título y descripción son opcionales: si no vienen se guardan vacíos
  @IsString({ message: 'El título debe ser texto' })
  @MaxLength(150, { message: 'El título no puede pasar de 150 caracteres' })
  title: string;

  @IsIn(['viaje', 'situacion', 'experiencia'], { message: 'El tipo debe ser: viaje, situacion o experiencia' })
  type: ExperienceCategory;

  @IsString({ message: 'La descripción debe ser texto' })
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
    this.title = typeof payload['title'] === 'string' ? payload['title'].trim() : ((payload['title'] ?? '') as string);
    this.type = payload['type'] as ExperienceCategory;
    this.description = typeof payload['description'] === 'string' ? payload['description'].trim() : ((payload['description'] ?? '') as string);
    this.imageUrl = payload['imageUrl'] as string | null | undefined;
    this.date = payload['date'] as string | null | undefined;
    this.participants = payload['participants'] as string[] | undefined;
  }

  validateDto(): Promise<void> {
    return validateOrThrow(this);
  }
}
