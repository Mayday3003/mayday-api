import type { IUserRepository } from '../../../domain/repository/IUser.repository.js';
import { AppError } from '../../../domain/entities/errors.js';
import { BcryptService } from '../../../infrastructure/services/bcrypt.service.js';
import { JwtService } from '../../../infrastructure/services/jwt.service.js';

const bcryptService = new BcryptService();
const jwtService = new JwtService();
import { EmailService } from '../../../infrastructure/services/email.service.js';

export class RequestPasswordResetUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string): Promise<{ message: string }> {
    if (!email || !email.trim()) {
      throw new AppError('Ingresa tu correo electrónico', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    // Por seguridad, si el correo no existe respondemos con éxito genérico para evitar enumeración de usuarios
    if (!user) {
      return { message: 'Si el correo está registrado, recibirás un enlace de recuperación.' };
    }

    // Token temporal de 1 hora con tipo reset
    const resetToken = jwtService.sign({
      id: user.id,
      role: user.role,
    });

    // Enviar correo de restablecimiento con Resend
    await EmailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'Si el correo está registrado, recibirás un enlace de recuperación.' };
  }
}

export class ResetPasswordUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(token: string, newPassword: string): Promise<{ message: string }> {
    if (!token) {
      throw new AppError('Token de restablecimiento no proporcionado', 400);
    }

    if (!newPassword || newPassword.length < 6) {
      throw new AppError('La nueva contraseña debe tener al menos 6 caracteres', 400);
    }

    let payload;
    try {
      payload = jwtService.verify(token);
    } catch (e) {
      throw new AppError('El enlace de recuperación es inválido o ha expirado', 400);
    }

    const user = await this.userRepository.findById(payload.id);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const newHashedPassword = await bcryptService.hash(newPassword);
    await this.userRepository.updatePassword(user.id, newHashedPassword);

    return { message: 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.' };
  }
}
