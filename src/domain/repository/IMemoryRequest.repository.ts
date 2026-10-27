import type { CreateMemoryRequestDto, MemoryRequestEntity, RequestStatus } from '../models/MemoryRequest.js';

export interface IMemoryRequestRepository {
  create(data: CreateMemoryRequestDto, userId: string): Promise<MemoryRequestEntity>;
  findById(id: string): Promise<MemoryRequestEntity | null>;
  findByUserId(userId: string): Promise<MemoryRequestEntity[]>;
  findAll(status?: RequestStatus): Promise<MemoryRequestEntity[]>;
  // Crea la experiencia del catálogo y marca la propuesta como aprobada en una sola transacción
  approve(id: string): Promise<MemoryRequestEntity>;
  reject(id: string): Promise<MemoryRequestEntity>;
  updateImage(id: string, imageUrl: string | null): Promise<MemoryRequestEntity>;
}
