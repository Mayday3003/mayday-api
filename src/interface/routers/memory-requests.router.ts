import { Router } from 'express';
import { MemoryRequestsController } from '../controllers/memory-requests.controller.js';
import { MemoryRequestsUseCase } from '../../application/memory-requests.use-case.js';
import { MemoryRequestPgRepository } from '../../infrastructure/repository/memory-requests.pg.repository.js';
import { UserPgRepository } from '../../infrastructure/repository/users.pg.repository.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { soloAdmin } from '../middlewares/role.middleware.js';
import { validateIdParam } from '../middlewares/validate.middleware.js';

const router: Router = Router();

const useCase = new MemoryRequestsUseCase(new MemoryRequestPgRepository(), new UserPgRepository());
const controller = new MemoryRequestsController(useCase);

// Usuario autenticado: propone un recuerdo a su nombre y consulta los suyos
router.post('/', authenticate, controller.create);
router.get('/mias', authenticate, controller.getMine);

// Solo admin: revisar, aprobar (se vuelve experiencia del catálogo) o rechazar
router.get('/', authenticate, soloAdmin, controller.getAll);
router.patch('/:id/aprobar', authenticate, soloAdmin, validateIdParam, controller.approve);
router.patch('/:id/rechazar', authenticate, soloAdmin, validateIdParam, controller.reject);

export default router;
