import { IExperienceRepository } from '../../../domain/repositories/index.js';
import { ExperienceEntity } from '../../../domain/entities/index.js';
import { CreateExperienceDto, UpdateExperienceDto, PaginatedResult } from '../../../domain/dtos/index.js';
import { NotFoundError, AppError } from '../../../domain/entities/errors.js';

export class GetExperiencesUseCase {
  constructor(private readonly experienceRepository: IExperienceRepository) {}

  async execute(page: number = 1, limit: number = 10, search?: string, type?: string): Promise<PaginatedResult<ExperienceEntity>> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit));
    return this.experienceRepository.findPaginated(validPage, validLimit, search, type);
  }
}

export class GetExperienceByIdUseCase {
  constructor(private readonly experienceRepository: IExperienceRepository) {}

  async execute(id: string): Promise<ExperienceEntity> {
    const experience = await this.experienceRepository.findById(id);
    if (!experience) {
      throw new NotFoundError(`No se encontró la experiencia con id: ${id}`);
    }
    return experience;
  }
}

export class CreateExperienceUseCase {
  constructor(private readonly experienceRepository: IExperienceRepository) {}

  async execute(dto: CreateExperienceDto): Promise<ExperienceEntity> {
    if (!dto.title || dto.title.trim().length < 3) {
      throw new AppError('El título debe tener al menos 3 caracteres', 400);
    }
    if (!dto.description || dto.description.trim().length < 10) {
      throw new AppError('La descripción debe tener al menos 10 caracteres', 400);
    }
    if (!['viaje', 'situacion', 'experiencia'].includes(dto.type)) {
      throw new AppError('El tipo debe ser: viaje, situacion o experiencia', 400);
    }

    return this.experienceRepository.create(dto);
  }
}

export class UpdateExperienceUseCase {
  constructor(private readonly experienceRepository: IExperienceRepository) {}

  async execute(id: string, dto: UpdateExperienceDto): Promise<ExperienceEntity> {
    await new GetExperienceByIdUseCase(this.experienceRepository).execute(id);
    return this.experienceRepository.update(id, dto);
  }
}

export class DeleteExperienceUseCase {
  constructor(private readonly experienceRepository: IExperienceRepository) {}

  async execute(id: string): Promise<boolean> {
    await new GetExperienceByIdUseCase(this.experienceRepository).execute(id);
    return this.experienceRepository.delete(id);
  }
}
