import type { InteractionEntity } from '../models/Interaction.js';

export interface IInteractionRepository {
  create(data: { content: string; userId: string; experienceId: string }): Promise<InteractionEntity>;
  findByUserId(userId: string): Promise<InteractionEntity[]>;
  findAll(): Promise<InteractionEntity[]>;
  findById(id: string): Promise<InteractionEntity | null>;
  delete(id: string): Promise<boolean>;
}
