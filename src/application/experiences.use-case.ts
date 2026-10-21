import type { IExperienceRepository } from '../domain/repository/IExperience.repository.js';
import type { CreateExperienceDto, ExperienceEntity, UpdateExperienceDto } from '../domain/models/Experience.js';
import type { PaginatedResult } from '../domain/models/Pagination.js';
import { BadRequestError } from './errors/bad-request.error.js';
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

  async create(dto: CreateExperienceDto): Promise<ExperienceEntity> {
    if (!dto.title || dto.title.trim().length < 3) {
      throw new BadRequestError('El título debe tener al menos 3 caracteres');
    }
    if (!dto.description || dto.description.trim().length < 10) {
      throw new BadRequestError('La descripción debe tener al menos 10 caracteres');
    }
    if (!['viaje', 'situacion', 'experiencia'].includes(dto.type)) {
      throw new BadRequestError('El tipo debe ser: viaje, situacion o experiencia');
    }

    return this.experienceRepository.create(dto);
  }

  async update(id: string, dto: UpdateExperienceDto): Promise<ExperienceEntity> {
    await this.getById(id);
    return this.experienceRepository.update(id, dto);
  }

  async delete(id: string): Promise<boolean> {
    await this.getById(id);
    return this.experienceRepository.delete(id);
  }
}
