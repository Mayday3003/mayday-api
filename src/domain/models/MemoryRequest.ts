import type { ExperienceCategory } from './Experience.js';

export type RequestStatus = 'pendiente' | 'aprobada' | 'rechazada';

export interface MemoryRequestEntity {
  id: string;
  title: string;
  type: ExperienceCategory;
  description: string;
  imageUrl: string | null;
  date: Date | null;
  participants: string[];
  status: RequestStatus;
  userId: string;
  experienceId: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMemoryRequestDto {
  title: string;
  type: ExperienceCategory;
  description: string;
  imageUrl?: string | null;
  date?: string | null;
  participants?: string[];
}
