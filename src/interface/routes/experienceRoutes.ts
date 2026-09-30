import { Router } from 'express';
import { ExperienceController } from '../controllers/experienceController.js';
import {
  GetExperiencesUseCase,
  GetExperienceByIdUseCase,
  CreateExperienceUseCase,
  UpdateExperienceUseCase,
  DeleteExperienceUseCase,
} from '../../application/usecases/experiences/experienceUseCases.js';
import { PrismaExperienceRepository } from '../../infrastructure/repositories/prismaRepositories.js';
import { authenticate, requireRole } from '../middlewares/authMiddleware.js';

export function createExperienceRouter(): Router {
  const router = Router();

  const repository = new PrismaExperienceRepository();
  const getExperiencesUseCase = new GetExperiencesUseCase(repository);
  const getExperienceByIdUseCase = new GetExperienceByIdUseCase(repository);
  const createExperienceUseCase = new CreateExperienceUseCase(repository);
  const updateExperienceUseCase = new UpdateExperienceUseCase(repository);
  const deleteExperienceUseCase = new DeleteExperienceUseCase(repository);

  const controller = new ExperienceController(
    getExperiencesUseCase,
    getExperienceByIdUseCase,
    createExperienceUseCase,
    updateExperienceUseCase,
    deleteExperienceUseCase
  );

  // Rutas públicas del catálogo
  // GET /api/experiencias -> { pagination, data }
  router.get('/', controller.getAll);
  // GET /api/experiencias/:id -> detalle con interacciones
  router.get('/:id', controller.getById);

  // Rutas protegidas solo para rol 'admin' (Criterio 4 de la rúbrica)
  // Sin token -> 401; Con token pero rol user -> 403
  router.post('/', authenticate, requireRole('admin'), controller.create);
  router.put('/:id', authenticate, requireRole('admin'), controller.update);
  router.delete('/:id', authenticate, requireRole('admin'), controller.delete);

  return router;
}
