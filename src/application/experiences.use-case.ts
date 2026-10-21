import type { IExperienceRepository } from '../domain/repository/IExperience.repository.js';
import type { ExperienceEntity } from '../domain/models/Experience.js';
import type { PaginatedResult } from '../domain/models/Pagination.js';
import { CreateExperienceBodyDto, UpdateExperienceBodyDto } from '../infrastructure/dtos/experience.dto.js';
import { NotFoundError } from './errors/not-found.error.js';

export class ExperiencesUseCase {
  constructor(private readonly experienceRepository: IExperienceRepository) {}

  async getAll(page: number = 1, limit: number = 10, search?: string, type?: string): Promise<PaginatedResult<ExperienceEntity>> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit));
    return this.experienceRepository.findPaginated(validPage, validLimit, search, type);
  }

  async getById(id: string): Promise<ExperienceEntity> {
    const experience = await this.experienceRepository.findById(id);
    if (!experience) {
      throw new NotFoundError(`No se encontró la experiencia con id: ${id}`);
    }
    return experience;
  }

  async create(payload: Record<string, unknown>): Promise<ExperienceEntity> {
    const dto = new CreateExperienceBodyDto(payload);
    await dto.validateDto();
    return this.experienceRepository.create(dto);
  }

  async update(id: string, payload: Record<string, unknown>): Promise<ExperienceEntity> {
    const dto = new UpdateExperienceBodyDto(payload);
    await dto.validateDto();
    await this.getById(id);
    return this.experienceRepository.update(id, dto);
  }

  async delete(id: string): Promise<boolean> {
    await this.getById(id);
    return this.experienceRepository.delete(id);
  }
}
