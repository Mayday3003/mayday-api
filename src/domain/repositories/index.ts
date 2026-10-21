import { UserEntity, ExperienceEntity, InteractionEntity } from '../entities/index.js';
import { CreateExperienceDto, UpdateExperienceDto, PaginatedResult } from '../dtos/index.js';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity>;
  updatePassword(id: string, newPasswordHash: string): Promise<UserEntity>;
}

export interface IExperienceRepository {
  findPaginated(page: number, limit: number, search?: string, type?: string): Promise<PaginatedResult<ExperienceEntity>>;
  findById(id: string): Promise<ExperienceEntity | null>;
  create(data: CreateExperienceDto): Promise<ExperienceEntity>;
  update(id: string, data: UpdateExperienceDto): Promise<ExperienceEntity>;
  delete(id: string): Promise<boolean>;
}

export interface IInteractionRepository {
  create(data: { content: string; userId: string; experienceId: string }): Promise<InteractionEntity>;
  findByUserId(userId: string): Promise<InteractionEntity[]>;
  findAll(): Promise<InteractionEntity[]>;
  findById(id: string): Promise<InteractionEntity | null>;
  delete(id: string): Promise<boolean>;
}
