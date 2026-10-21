import { IInteractionRepository, IExperienceRepository } from '../../../domain/repositories/index.js';
import { InteractionEntity } from '../../../domain/entities/index.js';
import { CreateInteractionDto } from '../../../domain/dtos/index.js';
import { NotFoundError, AppError } from '../../../domain/entities/errors.js';

export class CreateInteractionUseCase {
  constructor(
    private readonly interactionRepository: IInteractionRepository,
    private readonly experienceRepository: IExperienceRepository
  ) {}

  async execute(dto: CreateInteractionDto): Promise<InteractionEntity> {
    if (!dto.content || dto.content.trim().length < 3) {
      throw new AppError('El recuerdo o comentario debe tener al menos 3 caracteres', 400);
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
}

export class GetMyInteractionsUseCase {
  constructor(private readonly interactionRepository: IInteractionRepository) {}

  async execute(userId: string): Promise<InteractionEntity[]> {
    return this.interactionRepository.findByUserId(userId);
  }
}

export class GetAllInteractionsUseCase {
  constructor(private readonly interactionRepository: IInteractionRepository) {}

  async execute(): Promise<InteractionEntity[]> {
    return this.interactionRepository.findAll();
  }
}
