export type UserRole = 'admin' | 'user';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

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
