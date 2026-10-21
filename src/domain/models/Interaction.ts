import type { UserRole } from './User.js';
import type { ExperienceCategory } from './Experience.js';

export interface InteractionEntity {
  id: string;
  content: string;
  userId: string;
  experienceId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  experience?: {
    id: string;
    title: string;
    type: ExperienceCategory;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInteractionDto {
  content: string;
  experienceId: string;
  userId: string; // Proviene siempre del token verificado
}
