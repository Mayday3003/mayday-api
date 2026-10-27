import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../application/errors/unauthorized.error.js';
import { ExperiencesUseCase } from '../../application/experiences.use-case.js';

export class ExperiencesController {
  constructor(private readonly experiencesUseCase: ExperiencesUseCase) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.experiencesUseCase.getAll(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMeta = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.experiencesUseCase.getMeta();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.experiencesUseCase.getById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.experiencesUseCase.create(req.body ?? {});
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.experiencesUseCase.update(id, req.body ?? {});
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.experiencesUseCase.uploadImage(id, req.file);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!req.user) {
        throw new UnauthorizedError('Debes iniciar sesión para borrar un recuerdo');
      }
      await this.experiencesUseCase.delete(id, req.user);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
