import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { RegisterUseCase } from '../../application/usecases/auth/registerUseCase.js';
import { LoginUseCase } from '../../application/usecases/auth/loginUseCase.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/prismaRepositories.js';

export function createAuthRouter(): Router {
  const router = Router();

  const userRepository = new PrismaUserRepository();
  const registerUseCase = new RegisterUseCase(userRepository);
  const loginUseCase = new LoginUseCase(userRepository);
  const authController = new AuthController(registerUseCase, loginUseCase);

  // Endpoints públicos de autenticación
  router.post('/register', authController.register);
  router.post('/login', authController.login);

  return router;
}
