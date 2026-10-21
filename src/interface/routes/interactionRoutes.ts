import { Router } from 'express';
import { InteractionController } from '../controllers/interactionController.js';
import {
  CreateInteractionUseCase,
  GetMyInteractionsUseCase,
  GetAllInteractionsUseCase,
} from '../../application/usecases/interactions/interactionUseCases.js';
import { InteractionPgRepository } from '../../infrastructure/repository/interactions.pg.repository.js';
import { ExperiencePgRepository } from '../../infrastructure/repository/experiences.pg.repository.js';
import { authenticate, requireRole } from '../middlewares/authMiddleware.js';

export function createInteractionRouter(): Router {
  const router = Router();

  const interactionRepository = new InteractionPgRepository();
  const experienceRepository = new ExperiencePgRepository();

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
