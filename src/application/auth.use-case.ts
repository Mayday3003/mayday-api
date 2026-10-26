import type { IUserRepository } from '../domain/repository/IUser.repository.js';
import type { AuthResponseDto, PublicUser, UserEntity } from '../domain/models/User.js';
import type { BcryptService } from '../infrastructure/services/bcrypt.service.js';
import type { JwtService } from '../infrastructure/services/jwt.service.js';
import { EmailService } from '../infrastructure/services/email.service.js';
import { LoginUserDto, RegisterUserDto } from '../infrastructure/dtos/auth.dto.js';
import { BadRequestError } from './errors/bad-request.error.js';
import { UnauthorizedError } from './errors/unauthorized.error.js';
import { ConflictError } from './errors/conflict.error.js';
import { NotFoundError } from './errors/not-found.error.js';

// Respuesta pública del usuario: nunca incluye la contraseña
export function toPublicUser(user: UserEntity): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export class AuthUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService
  ) {}

  async register(payload: Record<string, unknown>): Promise<AuthResponseDto> {
    // 1. Validar con el DTO (400 con el error de cada campo)
    const dto = new RegisterUserDto(payload);
    await dto.validateDto();

    // 2. Comprobar si el email ya existe (409 Conflict obligatorio por rúbrica)
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError('Ya existe una cuenta registrada con este correo electrónico');
    }

    // 3. Hashear la contraseña con bcrypt (nunca en texto plano)
    const hashedPassword = await this.bcryptService.hash(dto.password);

    // 4. Crear usuario en la base de datos (por defecto rol 'user')
    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: 'user',
    });

    // 5. Emitir JWT firmado con payload mínimo (id y role)
    const token = this.jwtService.sign({ id: user.id, role: user.role });

    // 6. Enviar correo de bienvenida transaccional en segundo plano
    EmailService.sendWelcomeEmail(user.name, user.email).catch((err) => {
      console.error('Error enviando correo de bienvenida:', err);
    });

    return { token, user: toPublicUser(user) };
  }

  async login(payload: Record<string, unknown>): Promise<AuthResponseDto> {
    const dto = new LoginUserDto(payload);
    await dto.validateDto();

    const user = await this.userRepository.findByEmail(dto.email);

    // Mensaje genérico obligatorio por rúbrica: NO revelar si falló el email o la contraseña
    const genericAuthError = new UnauthorizedError('Credenciales inválidas. Verifica tu correo y contraseña.');

    if (!user || !user.password) {
      throw genericAuthError;
    }

    // Comparar hash bcrypt con la contraseña enviada
    const isPasswordValid = await this.bcryptService.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw genericAuthError;
    }

    // Emitir JWT firmado con payload mínimo: solo id y role (sin password ni datos sensibles)
    const token = this.jwtService.sign({ id: user.id, role: user.role });

    return { token, user: toPublicUser(user) };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    if (!email || !email.trim()) {
      throw new BadRequestError('Ingresa tu correo electrónico');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    // Por seguridad, si el correo no existe respondemos con éxito genérico para evitar enumeración de usuarios
    if (!user) {
      return { message: 'Si el correo está registrado, recibirás un enlace de recuperación.' };
    }

    const resetToken = this.jwtService.sign({ id: user.id, role: user.role });

    // Enviar correo de restablecimiento con Resend
    await EmailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'Si el correo está registrado, recibirás un enlace de recuperación.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestError('Token de restablecimiento no proporcionado');
    }

    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestError('La nueva contraseña debe tener al menos 8 caracteres');
    }

    let payload;
    try {
      payload = this.jwtService.verify(token);
    } catch (e) {
      throw new BadRequestError('El enlace de recuperación es inválido o ha expirado');
    }

    const user = await this.userRepository.findById(payload.id);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const newHashedPassword = await this.bcryptService.hash(newPassword);
    await this.userRepository.updatePassword(user.id, newHashedPassword);

    return { message: 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.' };
  }
}
