import type { IExperienceRepository } from '../domain/repository/IExperience.repository.js';
import type { ExperienceEntity, ExperienceMeta } from '../domain/models/Experience.js';
import type { PaginatedResult } from '../domain/models/Pagination.js';
import { CreateExperienceBodyDto, UpdateExperienceBodyDto } from '../infrastructure/dtos/experience.dto.js';
import { ExperienceQueryDto } from '../infrastructure/dtos/pagination.dto.js';
import { BadRequestError } from './errors/bad-request.error.js';
import type { IStorageService, UploadedImage } from '../domain/services/IStorage.service.js';
import { NotFoundError } from './errors/not-found.error.js';
import { ForbiddenError } from './errors/forbidden.error.js';
import type { UserRole } from '../domain/models/User.js';

type Requester = { id: string; role: UserRole };

export class ExperiencesUseCase {
  constructor(
    private readonly experienceRepository: IExperienceRepository,
    private readonly storageService: IStorageService
  ) {}

  async getAll(query: Record<string, unknown>): Promise<PaginatedResult<ExperienceEntity>> {
    // page/limit/type inválidos -> 400 (antes ?page=abc terminaba en NaN)
    const dto = new ExperienceQueryDto(query);
    await dto.validateDto();
    if (dto.from && dto.to && dto.from > dto.to) {
      throw new BadRequestError('Rango de fechas inválido', { from: 'from no puede ser posterior a to' });
    }
    return this.experienceRepository.findPaginated(dto);
  }

  async getMeta(): Promise<ExperienceMeta> {
    return this.experienceRepository.getMeta();
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

  // Editan el admin o quien propuso el recuerdo; cualquier otro usuario recibe 403
  private async getEditable(id: string, requester: Requester, action: string): Promise<ExperienceEntity> {
    const experience = await this.getById(id);
    if (requester.role !== 'admin' && experience.authorId !== requester.id) {
      throw new ForbiddenError(`Solo quien subió el recuerdo o el admin pueden ${action}lo`);
    }
    return experience;
  }

  async update(id: string, payload: Record<string, unknown>, requester: Requester): Promise<ExperienceEntity> {
    const dto = new UpdateExperienceBodyDto(payload);
    await dto.validateDto();
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new BadRequestError('Envía al menos un campo para actualizar');
    }
    await this.getEditable(id, requester, 'editar');
    return this.experienceRepository.update(id, dto);
  }

  async delete(id: string, requester: Requester): Promise<boolean> {
    const experience = await this.getEditable(id, requester, 'borrar');
    const deleted = await this.experienceRepository.delete(id);
    // Al borrar la experiencia también se borra su imagen del storage
    if (experience.imageUrl) {
      await this.storageService.removeByUrl(experience.imageUrl);
    }
    return deleted;
  }

  async uploadImage(id: string, file: UploadedImage | undefined, requester: Requester): Promise<ExperienceEntity> {
    if (!file) {
      throw new BadRequestError('Falta la imagen', { image: 'Adjunta un archivo en el campo "image"' });
    }
    const experience = await this.getEditable(id, requester, 'editar');

    const extension = file.mimetype.split('/')[1];
    const imageUrl = await this.storageService.upload(`${id}/${Date.now()}.${extension}`, file);
    const updated = await this.experienceRepository.update(id, { imageUrl });

    // La imagen anterior ya no se usa
    if (experience.imageUrl) {
      await this.storageService.removeByUrl(experience.imageUrl);
    }
    return updated;
  }
}
