import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { AuthUseCase } from '../../application/auth.use-case.js';
import { UserPgRepository } from '../../infrastructure/repository/users.pg.repository.js';
import { BcryptService } from '../../infrastructure/services/bcrypt.service.js';
import { JwtService } from '../../infrastructure/services/jwt.service.js';

const router: Router = Router();

// Composición: repositorio + servicios -> caso de uso -> controlador
const useCase = new AuthUseCase(new UserPgRepository(), new BcryptService(), new JwtService());
const controller = new AuthController(useCase);

// Endpoints públicos de autenticación
router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

export default router;
