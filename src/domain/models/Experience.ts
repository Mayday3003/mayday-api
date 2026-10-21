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
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}
