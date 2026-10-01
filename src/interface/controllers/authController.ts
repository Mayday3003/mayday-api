import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../application/usecases/auth/registerUseCase.js';
import { LoginUseCase } from '../../application/usecases/auth/loginUseCase.js';
import {
  RequestPasswordResetUseCase,
  ResetPasswordUseCase,
} from '../../application/usecases/auth/passwordResetUseCases.js';

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      const result = await this.registerUseCase.execute({ name, email, password });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.loginUseCase.execute({ email, password });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await this.requestPasswordResetUseCase.execute(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      const result = await this.resetPasswordUseCase.execute(token, newPassword);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
