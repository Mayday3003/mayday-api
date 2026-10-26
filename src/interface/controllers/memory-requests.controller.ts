import { Request, Response, NextFunction } from 'express';
import { MemoryRequestsUseCase } from '../../application/memory-requests.use-case.js';
import { UnauthorizedError } from '../../application/errors/unauthorized.error.js';

export class MemoryRequestsController {
  constructor(private readonly memoryRequestsUseCase: MemoryRequestsUseCase) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Debes iniciar sesión para proponer un recuerdo');
      }
      // El userId se toma del token verificado (req.user.id), NUNCA del body
      const result = await this.memoryRequestsUseCase.create(req.body ?? {}, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Debes iniciar sesión para consultar tus propuestas');
      }
      const result = await this.memoryRequestsUseCase.getMine(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = req.query.status as string | undefined;
      const result = await this.memoryRequestsUseCase.getAll(status);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.memoryRequestsUseCase.approve(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.memoryRequestsUseCase.reject(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
