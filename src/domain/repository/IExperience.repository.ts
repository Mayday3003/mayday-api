import type { CreateExperienceDto, ExperienceEntity, UpdateExperienceDto } from '../models/Experience.js';
import type { PaginatedResult } from '../models/Pagination.js';

export interface IExperienceRepository {
  findPaginated(page: number, limit: number, search?: string, type?: string): Promise<PaginatedResult<ExperienceEntity>>;
  findById(id: string): Promise<ExperienceEntity | null>;
  create(data: CreateExperienceDto): Promise<ExperienceEntity>;
  update(id: string, data: UpdateExperienceDto): Promise<ExperienceEntity>;
  delete(id: string): Promise<boolean>;
}
