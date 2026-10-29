import type { IMemoryRequestRepository } from '../../domain/repository/IMemoryRequest.repository.js';
import type { CreateMemoryRequestDto, MemoryRequestEntity, RequestStatus } from '../../domain/models/MemoryRequest.js';
import type { ExperienceCategory } from '../../domain/models/Experience.js';
import prisma from './client.js';

const includeUser = { user: { select: { id: true, name: true, email: true } } };

type MemoryRequestRow = Awaited<ReturnType<typeof prisma.memoryRequest.findFirstOrThrow<{ include: typeof includeUser }>>>;

function toEntity(row: MemoryRequestRow): MemoryRequestEntity {
  return {
    ...row,
    type: row.type as ExperienceCategory,
    status: row.status as RequestStatus,
  };
}

export class MemoryRequestPgRepository implements IMemoryRequestRepository {
  async create(data: CreateMemoryRequestDto, userId: string): Promise<MemoryRequestEntity> {
    const created = await prisma.memoryRequest.create({
      data: {
        title: data.title,
        type: data.type,
        description: data.description,
        imageUrl: data.imageUrl || null,
        date: data.date ? new Date(data.date) : null,
        participants: data.participants || [],
        userId,
      },
      include: includeUser,
    });
    return toEntity(created);
  }

  // Reemplaza los campos de la propuesta; sin imageUrl en el body se deja la foto que ya tenía
  async update(id: string, data: CreateMemoryRequestDto): Promise<MemoryRequestEntity> {
    const updated = await prisma.memoryRequest.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type,
        description: data.description,
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        date: data.date ? new Date(data.date) : null,
        participants: data.participants || [],
      },
      include: includeUser,
    });
    return toEntity(updated);
  }

  async findById(id: string): Promise<MemoryRequestEntity | null> {
    const item = await prisma.memoryRequest.findUnique({ where: { id }, include: includeUser });
    return item ? toEntity(item) : null;
  }

  async findByUserId(userId: string): Promise<MemoryRequestEntity[]> {
    const items = await prisma.memoryRequest.findMany({
      where: { userId },
      include: includeUser,
      orderBy: { createdAt: 'desc' },
    });
    return items.map(toEntity);
  }

  async findAll(status?: RequestStatus): Promise<MemoryRequestEntity[]> {
    const items = await prisma.memoryRequest.findMany({
      where: status ? { status } : {},
      include: includeUser,
      orderBy: { createdAt: 'desc' },
    });
    return items.map(toEntity);
  }

  async approve(id: string): Promise<MemoryRequestEntity> {
    const updated = await prisma.$transaction(async (tx) => {
      const request = await tx.memoryRequest.findUniqueOrThrow({ where: { id } });
      const experience = await tx.experience.create({
        data: {
          title: request.title,
          type: request.type,
          description: request.description,
          imageUrl: request.imageUrl,
          date: request.date,
          participants: request.participants,
        },
      });
      return tx.memoryRequest.update({
        where: { id },
        data: { status: 'aprobada', experienceId: experience.id },
        include: includeUser,
      });
    });
    return toEntity(updated);
  }

  async reject(id: string): Promise<MemoryRequestEntity> {
    const updated = await prisma.memoryRequest.update({
      where: { id },
      data: { status: 'rechazada' },
      include: includeUser,
    });
    return toEntity(updated);
  }

  async updateImage(id: string, imageUrl: string | null): Promise<MemoryRequestEntity> {
    const updated = await prisma.memoryRequest.update({
      where: { id },
      data: { imageUrl },
      include: includeUser,
    });
    return toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.memoryRequest.delete({ where: { id } });
  }
}
