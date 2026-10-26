import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import type { ExperienceFilterOptions } from '../../domain/models/Experience.js';
import { validateOrThrow } from './validate.js';

// Convierte "2" -> 2; deja NaN para que class-validator lo rechace (ej. ?page=abc)
function toInt(value: unknown): number | undefined {
  if (value === undefined || value === '') return undefined;
  return typeof value === 'string' && /^-?\d+$/.test(value) ? Number(value) : NaN;
}

// Query de GET /api/experiencias
export class ExperienceQueryDto implements ExperienceFilterOptions {
  @IsInt({ message: 'page debe ser un entero mayor o igual a 1' })
  @Min(1, { message: 'page debe ser un entero mayor o igual a 1' })
  page: number;

  @IsInt({ message: 'limit debe ser un entero entre 1 y 50' })
  @Min(1, { message: 'limit debe ser un entero entre 1 y 50' })
  @Max(50, { message: 'limit debe ser un entero entre 1 y 50' })
  limit: number;

  @IsOptional()
  @IsString({ message: 'search debe ser texto' })
  @MaxLength(100, { message: 'search no puede superar 100 caracteres' })
  search?: string;

  @IsOptional()
  @IsIn(['viaje', 'situacion', 'experiencia', 'todos'], { message: 'type debe ser: viaje, situacion, experiencia o todos' })
  type?: string;

  constructor(query: Record<string, unknown>) {
    this.page = toInt(query['page']) ?? 1;
    this.limit = toInt(query['limit']) ?? 10;
    this.search = typeof query['search'] === 'string' && query['search'].trim() !== '' ? query['search'].trim() : (query['search'] as string | undefined);
    this.type = query['type'] as string | undefined;
  }

  validateDto(): Promise<void> {
    return validateOrThrow(this);
  }
}
