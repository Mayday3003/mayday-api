export type ExperienceCategory = 'viaje' | 'situacion' | 'experiencia';

export interface ExperienceEntity {
  id: string;
  title: string;
  type: ExperienceCategory;
  description: string;
  imageUrl: string | null;
  date: Date | null;
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
  // Quien propuso el recuerdo (null si lo creó el admin directamente). Solo viene en el detalle.
  authorId?: string | null;
}

export interface CreateExperienceDto {
  title: string;
  type: ExperienceCategory;
  description: string;
  imageUrl?: string | null;
  date?: string | Date | null;
  participants?: string[];
}

export type UpdateExperienceDto = Partial<CreateExperienceDto>;

export interface ExperienceFilterOptions {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  participant?: string;
  from?: string; // AAAA-MM-DD, inclusive
  to?: string; // AAAA-MM-DD, inclusive
}

// Valores para llenar los selects de filtros en el frontend
export interface ExperienceMeta {
  types: ExperienceCategory[];
  participants: string[];
}
