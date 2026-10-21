import type { UserEntity } from '../models/User.js';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity>;
  updatePassword(id: string, newPasswordHash: string): Promise<UserEntity>;
}
