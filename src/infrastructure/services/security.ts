import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JwtPayloadDto } from '../../domain/dtos/index.js';

export class PasswordService {
  private static readonly SALT_ROUNDS = 10;

  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export class TokenService {
  private static getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está configurado en las variables de entorno');
    }
    return secret;
  }

  private static getExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '7d';
  }

  static sign(payload: JwtPayloadDto): string {
    const secret = this.getSecret();
    const expiresIn = this.getExpiresIn();
    // Payload mínimo: id y role
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }

  static verify(token: string): JwtPayloadDto {
    const secret = this.getSecret();
    return jwt.verify(token, secret) as JwtPayloadDto;
  }
}
