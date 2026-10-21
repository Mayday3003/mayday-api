import { IsArray, IsDateString, IsIn, IsOptional, IsString, Length, MinLength } from 'class-validator';
import type { CreateExperienceDto, ExperienceCategory, UpdateExperienceDto } from '../../domain/models/Experience.js';
import { validateOrThrow } from './validate.js';

const CATEGORIES: ExperienceCategory[] = ['viaje', 'situacion', 'experiencia'];

export class CreateExperienceBodyDto implements CreateExperienceDto {
  @IsString({ message: 'El título es obligatorio' })
  @Length(3, 150, { message: 'El título debe tener entre 3 y 150 caracteres' })
  title: string;

  @IsIn(CATEGORIES, { message: 'El tipo debe ser: viaje, situacion o experiencia' })
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

export class UpdateExperienceBodyDto implements UpdateExperienceDto {
  @IsOptional()
  @IsString({ message: 'El título debe ser texto' })
  @Length(3, 150, { message: 'El título debe tener entre 3 y 150 caracteres' })
  title?: string;

  @IsOptional()
  @IsIn(CATEGORIES, { message: 'El tipo debe ser: viaje, situacion o experiencia' })
  type?: ExperienceCategory;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  description?: string;

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
    // Solo se asignan los campos que vienen en el body para no pisar los demás con undefined
    if ('title' in payload) this.title = typeof payload['title'] === 'string' ? payload['title'].trim() : (payload['title'] as string);
    if ('type' in payload) this.type = payload['type'] as ExperienceCategory;
    if ('description' in payload) this.description = typeof payload['description'] === 'string' ? payload['description'].trim() : (payload['description'] as string);
    if ('imageUrl' in payload) this.imageUrl = payload['imageUrl'] as string | null;
    if ('date' in payload) this.date = payload['date'] as string | null;
    if ('participants' in payload) this.participants = payload['participants'] as string[];
  }

  validateDto(): Promise<void> {
    return validateOrThrow(this);
  }
}
