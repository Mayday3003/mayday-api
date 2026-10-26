import type { CreateExperienceDto, ExperienceEntity, ExperienceFilterOptions, ExperienceMeta, UpdateExperienceDto } from '../models/Experience.js';
import type { PaginatedResult } from '../models/Pagination.js';

export interface IExperienceRepository {
  findPaginated(filters: ExperienceFilterOptions): Promise<PaginatedResult<ExperienceEntity>>;
  getMeta(): Promise<ExperienceMeta>;
  findById(id: string): Promise<ExperienceEntity | null>;
  create(data: CreateExperienceDto): Promise<ExperienceEntity>;
  update(id: string, data: UpdateExperienceDto): Promise<ExperienceEntity>;
  delete(id: string): Promise<boolean>;
}
