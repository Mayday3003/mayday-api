import { Request, Response, NextFunction } from 'express';
import { AuthUseCase } from '../../application/auth.use-case.js';

export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // El DTO solo copia name, email y password: cualquier `role` del body se ignora
      const result = await this.authUseCase.register(req.body ?? {});
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authUseCase.login(req.body ?? {});
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await this.authUseCase.requestPasswordReset(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      const result = await this.authUseCase.resetPassword(token, newPassword);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
