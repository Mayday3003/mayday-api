import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { RegisterUseCase } from '../../application/usecases/auth/registerUseCase.js';
import { LoginUseCase } from '../../application/usecases/auth/loginUseCase.js';
import {
  RequestPasswordResetUseCase,
  ResetPasswordUseCase,
} from '../../application/usecases/auth/passwordResetUseCases.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/prismaRepositories.js';

export function createAuthRouter(): Router {
  const router = Router();

  const userRepository = new PrismaUserRepository();
  const registerUseCase = new RegisterUseCase(userRepository);
  const loginUseCase = new LoginUseCase(userRepository);
  const requestPasswordResetUseCase = new RequestPasswordResetUseCase(userRepository);
  const resetPasswordUseCase = new ResetPasswordUseCase(userRepository);

  const authController = new AuthController(
    registerUseCase,
    loginUseCase,
    requestPasswordResetUseCase,
    resetPasswordUseCase
  );

  // Endpoints públicos de autenticación
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.post('/forgot-password', authController.forgotPassword);
  router.post('/reset-password', authController.resetPassword);

  return router;
}
