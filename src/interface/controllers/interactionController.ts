import { Request, Response, NextFunction } from 'express';
import {
  CreateInteractionUseCase,
  GetMyInteractionsUseCase,
  GetAllInteractionsUseCase,
} from '../../application/usecases/interactions/interactionUseCases.js';
import { UnauthorizedError } from '../../domain/entities/errors.js';

export class InteractionController {
  constructor(
    private readonly createInteractionUseCase: CreateInteractionUseCase,
    private readonly getMyInteractionsUseCase: GetMyInteractionsUseCase,
    private readonly getAllInteractionsUseCase: GetAllInteractionsUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Debes iniciar sesión para publicar un recuerdo');
      }

      const { content, experienceId } = req.body;

      // REGLA DE ORO DE LA RÚBRICA: El userId se toma estrictamente del token verificado (req.user.id), NUNCA del body
      const result = await this.createInteractionUseCase.execute({
        content,
        experienceId,
        userId: req.user.id,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Debes iniciar sesión para consultar tus recuerdos');
      }

      const result = await this.getMyInteractionsUseCase.execute(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getAllInteractionsUseCase.execute();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
