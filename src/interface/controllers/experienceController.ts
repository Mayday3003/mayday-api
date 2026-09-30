import { Request, Response, NextFunction } from 'express';
import {
  GetExperiencesUseCase,
  GetExperienceByIdUseCase,
  CreateExperienceUseCase,
  UpdateExperienceUseCase,
  DeleteExperienceUseCase,
} from '../../application/usecases/experiences/experienceUseCases.js';

export class ExperienceController {
  constructor(
    private readonly getExperiencesUseCase: GetExperiencesUseCase,
    private readonly getExperienceByIdUseCase: GetExperienceByIdUseCase,
    private readonly createExperienceUseCase: CreateExperienceUseCase,
    private readonly updateExperienceUseCase: UpdateExperienceUseCase,
    private readonly deleteExperienceUseCase: DeleteExperienceUseCase
  ) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const type = req.query.type as string | undefined;

      const result = await this.getExperiencesUseCase.execute(page, limit, search, type);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.getExperienceByIdUseCase.execute(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.createExperienceUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.updateExperienceUseCase.execute(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.deleteExperienceUseCase.execute(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
