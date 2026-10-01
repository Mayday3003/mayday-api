import { IUserRepository } from '../../../domain/repositories/index.js';
import { RegisterDto, AuthResponseDto } from '../../../domain/dtos/index.js';
import { ConflictError, AppError } from '../../../domain/entities/errors.js';
import { PasswordService, TokenService } from '../../../infrastructure/services/security.js';
import { EmailService } from '../../../infrastructure/services/emailService.js';

export class RegisterUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: RegisterDto): Promise<AuthResponseDto> {
    // 1. Validaciones básicas de entrada
    if (!dto.name || dto.name.trim().length < 2) {
      throw new AppError('El nombre debe tener al menos 2 caracteres', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!dto.email || !emailRegex.test(dto.email)) {
      throw new AppError('Ingresa un correo electrónico válido', 400);
    }

    if (!dto.password || dto.password.length < 6) {
      throw new AppError('La contraseña debe tener al menos 6 caracteres', 400);
    }

    // 2. Comprobar si el email ya existe (409 Conflict obligatorio por rúbrica)
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError('Ya existe una cuenta registrada con este correo electrónico');
    }

    // 3. Hashear la contraseña con bcrypt (nunca en texto plano)
    const hashedPassword = await PasswordService.hash(dto.password);

    // 4. Crear usuario en la base de datos (por defecto rol 'user')
    const user = await this.userRepository.create({
      name: dto.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
    });

    // 5. Emitir JWT firmado con payload mínimo (id y role)
    const token = TokenService.sign({
      id: user.id,
      role: user.role,
    });

    // 6. Enviar correo de bienvenida transaccional en segundo plano
    EmailService.sendWelcomeEmail(user.name, user.email).catch((err) => {
      console.error('Error enviando correo de bienvenida:', err);
    });

    // 7. Responder sin incluir la contraseña bajo ningún motivo
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
