import type { IExperienceRepository } from '../domain/repository/IExperience.repository.js';
import type { ExperienceEntity } from '../domain/models/Experience.js';
import type { PaginatedResult } from '../domain/models/Pagination.js';
import { CreateExperienceBodyDto, UpdateExperienceBodyDto } from '../infrastructure/dtos/experience.dto.js';
import { ExperienceQueryDto } from '../infrastructure/dtos/pagination.dto.js';
import { BadRequestError } from './errors/bad-request.error.js';
import { NotFoundError } from './errors/not-found.error.js';

export class ExperiencesUseCase {
  constructor(private readonly experienceRepository: IExperienceRepository) {}

  async getAll(query: Record<string, unknown>): Promise<PaginatedResult<ExperienceEntity>> {
    // page/limit/type inválidos -> 400 (antes ?page=abc terminaba en NaN)
    const dto = new ExperienceQueryDto(query);
    await dto.validateDto();
    return this.experienceRepository.findPaginated(dto.page, dto.limit, dto.search, dto.type);
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
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new BadRequestError('Envía al menos un campo para actualizar');
    }
    await this.getById(id);
    return this.experienceRepository.update(id, dto);
  }

  async delete(id: string): Promise<boolean> {
    await this.getById(id);
    return this.experienceRepository.delete(id);
  }
}
