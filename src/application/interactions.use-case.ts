import type { IInteractionRepository } from '../domain/repository/IInteraction.repository.js';
import type { IExperienceRepository } from '../domain/repository/IExperience.repository.js';
import type { CreateInteractionDto, InteractionEntity } from '../domain/models/Interaction.js';
import { BadRequestError } from './errors/bad-request.error.js';
import { NotFoundError } from './errors/not-found.error.js';

export class InteractionsUseCase {
  constructor(
    private readonly interactionRepository: IInteractionRepository,
    private readonly experienceRepository: IExperienceRepository
  ) {}

  async create(dto: CreateInteractionDto): Promise<InteractionEntity> {
    if (!dto.content || dto.content.trim().length < 3) {
      throw new BadRequestError('El recuerdo o comentario debe tener al menos 3 caracteres');
    }

    // Verificar que la experiencia exista antes de asociar el comentario
    const experience = await this.experienceRepository.findById(dto.experienceId);
    if (!experience) {
      throw new NotFoundError(`No se encontró la experiencia vinculada con id: ${dto.experienceId}`);
    }

    // El userId proviene directamente del token verificado por el middleware, nunca del body
    return this.interactionRepository.create({
      content: dto.content.trim(),
      userId: dto.userId,
      experienceId: dto.experienceId,
    });
  }

  async getMine(userId: string): Promise<InteractionEntity[]> {
    return this.interactionRepository.findByUserId(userId);
  }

  async getAll(): Promise<InteractionEntity[]> {
    return this.interactionRepository.findAll();
  }
}
