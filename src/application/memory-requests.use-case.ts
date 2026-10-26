import type { IMemoryRequestRepository } from '../domain/repository/IMemoryRequest.repository.js';
import type { MemoryRequestEntity, RequestStatus } from '../domain/models/MemoryRequest.js';
import { CreateMemoryRequestBodyDto } from '../infrastructure/dtos/memory-request.dto.js';
import { BadRequestError } from './errors/bad-request.error.js';
import { ConflictError } from './errors/conflict.error.js';
import type { IUserRepository } from '../domain/repository/IUser.repository.js';
import { NotFoundError } from './errors/not-found.error.js';
import { UnauthorizedError } from './errors/unauthorized.error.js';

const STATUSES: RequestStatus[] = ['pendiente', 'aprobada', 'rechazada'];

export class MemoryRequestsUseCase {
  constructor(
    private readonly memoryRequestRepository: IMemoryRequestRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async create(payload: Record<string, unknown>, userId: string): Promise<MemoryRequestEntity> {
    const dto = new CreateMemoryRequestBodyDto(payload);
    await dto.validateDto();
    // El token puede ser válido aunque el usuario ya no exista (fue borrado): eso es 401, no 400
    if (!(await this.userRepository.findById(userId))) {
      throw new UnauthorizedError('Tu sesión ya no es válida. Inicia sesión de nuevo.');
    }
    // El autor sale del token verificado, nunca del body
    return this.memoryRequestRepository.create(dto, userId);
  }

  async getMine(userId: string): Promise<MemoryRequestEntity[]> {
    return this.memoryRequestRepository.findByUserId(userId);
  }

  async getAll(status?: string): Promise<MemoryRequestEntity[]> {
    if (status !== undefined && !STATUSES.includes(status as RequestStatus)) {
      throw new BadRequestError('Estado inválido', { status: 'Debe ser: pendiente, aprobada o rechazada' });
    }
    return this.memoryRequestRepository.findAll(status as RequestStatus | undefined);
  }

  async approve(id: string): Promise<MemoryRequestEntity> {
    await this.getPending(id);
    return this.memoryRequestRepository.approve(id);
  }

  async reject(id: string): Promise<MemoryRequestEntity> {
    await this.getPending(id);
    return this.memoryRequestRepository.reject(id);
  }

  // Solo una propuesta pendiente se puede aprobar o rechazar
  private async getPending(id: string): Promise<MemoryRequestEntity> {
    const request = await this.memoryRequestRepository.findById(id);
    if (!request) {
      throw new NotFoundError(`No se encontró la propuesta con id: ${id}`);
    }
    if (request.status !== 'pendiente') {
      throw new ConflictError(`La propuesta ya fue ${request.status}`);
    }
    return request;
  }
}
