import { Router } from 'express';
import { ExperiencesController } from '../controllers/experiences.controller.js';
import { ExperiencesUseCase } from '../../application/experiences.use-case.js';
import { ExperiencePgRepository } from '../../infrastructure/repository/experiences.pg.repository.js';
import { SupabaseStorageService } from '../../infrastructure/services/storage.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { soloAdmin } from '../middlewares/role.middleware.js';
import { validateIdParam } from '../middlewares/validate.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';

const router: Router = Router();

const useCase = new ExperiencesUseCase(new ExperiencePgRepository(), new SupabaseStorageService());
const controller = new ExperiencesController(useCase);

// Rutas públicas del catálogo
// GET /api/experiencias -> { pagination, data }
router.get('/', controller.getAll);
// GET /api/experiencias/:id -> detalle con interacciones
// GET /api/experiencias/meta -> tipos y participantes para los filtros (antes de /:id)
router.get('/meta', controller.getMeta);
router.get('/:id', validateIdParam, controller.getById);

// Rutas protegidas solo para rol 'admin' (Criterio 4 de la rúbrica)
// Sin token -> 401; Con token pero rol user -> 403
router.post('/', authenticate, soloAdmin, controller.create);
router.put('/:id', authenticate, soloAdmin, validateIdParam, controller.update);
// POST /api/experiencias/:id/imagen -> multipart/form-data con el campo "image" (máx. 5 MB)
router.post('/:id/imagen', authenticate, soloAdmin, validateIdParam, uploadImage, controller.uploadImage);
router.delete('/:id', authenticate, soloAdmin, validateIdParam, controller.delete);

export default router;
