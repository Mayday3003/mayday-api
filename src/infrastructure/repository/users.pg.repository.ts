import { IUserRepository } from '../../domain/repositories/index.js';
import { UserEntity, UserRole } from '../../domain/entities/index.js';
import prisma from './client.js';

export class UserPgRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return {
      ...user,
      role: user.role as UserRole,
    };
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      ...user,
      role: user.role as UserRole,
    };
  }

  async create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    const created = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password!,
        role: data.role,
      },
    });
    return {
      ...created,
      role: created.role as UserRole,
    };
  }

  async updatePassword(id: string, newPasswordHash: string): Promise<UserEntity> {
    const updated = await prisma.user.update({
      where: { id },
      data: { password: newPasswordHash },
    });
    return {
      ...updated,
      role: updated.role as UserRole,
    };
  }
}
