import jwt from 'jsonwebtoken';
import { JwtPayloadDto } from '../../domain/dtos/index.js';

export class JwtService {
  private getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está configurado en las variables de entorno');
    }
    return secret;
  }

  private getExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '7d';
  }

  sign(payload: JwtPayloadDto): string {
    // Payload mínimo: id y role
    const data: JwtPayloadDto = { id: payload.id, role: payload.role };
    return jwt.sign(data, this.getSecret(), { expiresIn: this.getExpiresIn() } as jwt.SignOptions);
  }

  verify(token: string): JwtPayloadDto {
    return jwt.verify(token, this.getSecret()) as JwtPayloadDto;
  }
}
