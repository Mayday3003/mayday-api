import { Router } from 'express';
import { InteractionController } from '../controllers/interactionController.js';
import {
  CreateInteractionUseCase,
  GetMyInteractionsUseCase,
  GetAllInteractionsUseCase,
} from '../../application/usecases/interactions/interactionUseCases.js';
import {
  PrismaInteractionRepository,
  PrismaExperienceRepository,
} from '../../infrastructure/repositories/prismaRepositories.js';
import { authenticate, requireRole } from '../middlewares/authMiddleware.js';

export function createInteractionRouter(): Router {
  const router = Router();

  const interactionRepository = new PrismaInteractionRepository();
  const experienceRepository = new PrismaExperienceRepository();

  const createUseCase = new CreateInteractionUseCase(interactionRepository, experienceRepository);
  const getMyUseCase = new GetMyInteractionsUseCase(interactionRepository);
  const getAllUseCase = new GetAllInteractionsUseCase(interactionRepository);

  const controller = new InteractionController(createUseCase, getMyUseCase, getAllUseCase);

  // 1. POST /api/interacciones -> Usuario autenticado (crea a su nombre usando el token)
  router.post('/', authenticate, controller.create);

  // 2. GET /api/interacciones/mias -> Usuario autenticado (solo sus propias interacciones)
  router.get('/mias', authenticate, controller.getMy);

  // 3. GET /api/interacciones -> Solo admin (todas las interacciones de todos los usuarios)
  router.get('/', authenticate, requireRole('admin'), controller.getAll);

  return router;
}
