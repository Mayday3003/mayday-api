import { Request, Response, NextFunction } from 'express';
import { InteractionsUseCase } from '../../application/interactions.use-case.js';
import { UnauthorizedError } from '../../application/errors/unauthorized.error.js';

export class InteractionsController {
  constructor(private readonly interactionsUseCase: InteractionsUseCase) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Debes iniciar sesión para publicar un recuerdo');
      }

      // REGLA DE ORO DE LA RÚBRICA: El userId se toma estrictamente del token verificado (req.user.id), NUNCA del body
      const result = await this.interactionsUseCase.create(req.body ?? {}, req.user.id);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Debes iniciar sesión para consultar tus recuerdos');
      }

      const result = await this.interactionsUseCase.getMine(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.interactionsUseCase.getAll();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
