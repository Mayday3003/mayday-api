import type { IInteractionRepository } from '../domain/repository/IInteraction.repository.js';
import type { IExperienceRepository } from '../domain/repository/IExperience.repository.js';
import type { InteractionEntity } from '../domain/models/Interaction.js';
import { CreateInteractionBodyDto } from '../infrastructure/dtos/interaction.dto.js';
import type { IUserRepository } from '../domain/repository/IUser.repository.js';
import { NotFoundError } from './errors/not-found.error.js';
import { UnauthorizedError } from './errors/unauthorized.error.js';

export class InteractionsUseCase {
  constructor(
    private readonly interactionRepository: IInteractionRepository,
    private readonly experienceRepository: IExperienceRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async create(payload: Record<string, unknown>, userId: string): Promise<InteractionEntity> {
    const dto = new CreateInteractionBodyDto(payload);
    await dto.validateDto();

    // El token puede ser válido aunque el usuario ya no exista (fue borrado): eso es 401, no 400
    if (!(await this.userRepository.findById(userId))) {
      throw new UnauthorizedError('Tu sesión ya no es válida. Inicia sesión de nuevo.');
    }

    // Verificar que la experiencia exista antes de asociar el comentario
    const experience = await this.experienceRepository.findById(dto.experienceId);
    if (!experience) {
      throw new NotFoundError(`No se encontró la experiencia vinculada con id: ${dto.experienceId}`);
    }

    // El userId proviene directamente del token verificado por el middleware, nunca del body
    return this.interactionRepository.create({
      content: dto.content,
      userId,
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
