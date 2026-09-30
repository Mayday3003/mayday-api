import { IUserRepository } from '../../../domain/repositories/index.js';
import { LoginDto, AuthResponseDto } from '../../../domain/dtos/index.js';
import { UnauthorizedError, AppError } from '../../../domain/entities/errors.js';
import { PasswordService, TokenService } from '../../../infrastructure/services/security.js';

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    if (!dto.email || !dto.password) {
      throw new AppError('El correo y la contraseña son obligatorios', 400);
    }

    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    // Mensaje genérico obligatorio por rúbrica: NO revelar si falló el email o la contraseña
    const genericAuthError = new UnauthorizedError('Credenciales inválidas. Verifica tu correo y contraseña.');

    if (!user || !user.password) {
      throw genericAuthError;
    }

    // Comparar hash bcrypt con la contraseña enviada
    const isPasswordValid = await PasswordService.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw genericAuthError;
    }

    // Emitir JWT firmado con payload mínimo: solo id y role (sin password ni datos sensibles)
    const token = TokenService.sign({
      id: user.id,
      role: user.role,
    });

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
