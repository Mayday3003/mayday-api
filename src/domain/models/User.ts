export type UserRole = 'admin' | 'user';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Datos que viajan entre capas para autenticación
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponseDto {
  token: string;
  user: PublicUser;
}

// Payload mínimo del JWT: solo id y role
export interface JwtPayloadDto {
  id: string;
  role: UserRole;
}
