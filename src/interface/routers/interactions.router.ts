import { Router } from 'express';
import { InteractionsController } from '../controllers/interactions.controller.js';
import { InteractionsUseCase } from '../../application/interactions.use-case.js';
import { InteractionPgRepository } from '../../infrastructure/repository/interactions.pg.repository.js';
import { ExperiencePgRepository } from '../../infrastructure/repository/experiences.pg.repository.js';
import { UserPgRepository } from '../../infrastructure/repository/users.pg.repository.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { soloAdmin } from '../middlewares/role.middleware.js';

const router: Router = Router();

const useCase = new InteractionsUseCase(new InteractionPgRepository(), new ExperiencePgRepository(), new UserPgRepository());
const controller = new InteractionsController(useCase);

// 1. POST /api/interacciones -> Usuario autenticado (crea a su nombre usando el token)
router.post('/', authenticate, controller.create);

// 2. GET /api/interacciones/mias -> Usuario autenticado (solo sus propias interacciones)
router.get('/mias', authenticate, controller.getMine);

// 3. GET /api/interacciones -> Solo admin (todas las interacciones de todos los usuarios)
router.get('/', authenticate, soloAdmin, controller.getAll);

export default router;
