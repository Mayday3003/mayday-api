import { UserRole, ExperienceCategory } from '../entities/index.js';

// DTOs de Autenticación
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface JwtPayloadDto {
  id: string;
  role: UserRole;
}

// DTOs de Catálogo (Experiencias)
export interface CreateExperienceDto {
  title: string;
  type: ExperienceCategory;
  description: string;
  imageUrl?: string | null;
  date?: string | Date | null;
  participants?: string[];
}

export interface UpdateExperienceDto {
  title?: string;
  type?: ExperienceCategory;
  description?: string;
  imageUrl?: string | null;
  date?: string | Date | null;
  participants?: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  pagination: PaginationMeta;
  data: T[];
}

// DTOs de Interacción
export interface CreateInteractionDto {
  content: string;
  experienceId: string;
  userId: string; // Proviene siempre del token verificado
}
