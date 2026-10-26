import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import type { LoginDto, RegisterDto } from '../../domain/models/User.js';
import { validateOrThrow } from './validate.js';

export class RegisterUserDto implements RegisterDto {
  @IsString({ message: 'El nombre es obligatorio' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  name: string;

  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  email: string;

  @IsString({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  // Solo se copian los campos permitidos: un `role` en el body nunca llega al DTO
  constructor(payload: Record<string, unknown>) {
    this.name = typeof payload['name'] === 'string' ? payload['name'].trim() : (payload['name'] as string);
    this.email = typeof payload['email'] === 'string' ? payload['email'].toLowerCase().trim() : (payload['email'] as string);
    this.password = payload['password'] as string;
  }

  validateDto(): Promise<void> {
    return validateOrThrow(this);
  }
}

export class LoginUserDto implements LoginDto {
  @IsString({ message: 'El correo es obligatorio' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;

  @IsString({ message: 'La contraseña es obligatoria' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  constructor(payload: Record<string, unknown>) {
    this.email = typeof payload['email'] === 'string' ? payload['email'].toLowerCase().trim() : (payload['email'] as string);
    this.password = payload['password'] as string;
  }

  validateDto(): Promise<void> {
    return validateOrThrow(this);
  }
}
