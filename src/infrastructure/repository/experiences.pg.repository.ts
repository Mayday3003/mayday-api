import type { IExperienceRepository } from '../../domain/repository/IExperience.repository.js';
import type {
  ExperienceEntity,
  ExperienceCategory,
  ExperienceFilterOptions,
  ExperienceMeta,
  CreateExperienceDto,
  UpdateExperienceDto,
} from '../../domain/models/Experience.js';
import type { PaginatedResult } from '../../domain/models/Pagination.js';
import { Prisma } from '@prisma/client';
import prisma from './client.js';

export class ExperiencePgRepository implements IExperienceRepository {
  async findPaginated(filters: ExperienceFilterOptions): Promise<PaginatedResult<ExperienceEntity>> {
    const { page, limit, search, type, participant, from, to } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ExperienceWhereInput = {};
    if (type && type !== 'todos') {
      where.type = type as ExperienceCategory;
    }
    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    // Todos los filtros se combinan (AND) en el mismo where
    if (participant) {
      where.participants = { has: participant };
    }
    if (from || to) {
      where.date = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }

    const [total, items] = await Promise.all([
      prisma.experience.count({ where }),
      prisma.experience.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      data: items.map((item) => ({
        ...item,
        type: item.type as ExperienceCategory,
      })),
    };
  }

  async getMeta(): Promise<ExperienceMeta> {
    const rows = await prisma.experience.findMany({ select: { participants: true } });
    const participants = [...new Set(rows.flatMap((row) => row.participants))].sort((a, b) => a.localeCompare(b, 'es'));
    return { types: ['viaje', 'situacion', 'experiencia'], participants };
  }

  async findById(id: string): Promise<ExperienceEntity | null> {
    const item = await prisma.experience.findUnique({
      where: { id },
      include: {
        interactions: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        memoryRequest: { select: { userId: true } },
      },
    });

    if (!item) return null;

    const { memoryRequest, ...experience } = item;
    return {
      ...experience,
      type: item.type as ExperienceCategory,
      authorId: memoryRequest?.userId ?? null,
    };
  }

  async create(data: CreateExperienceDto): Promise<ExperienceEntity> {
    const created = await prisma.experience.create({
      data: {
        title: data.title,
        type: data.type,
        description: data.description,
        imageUrl: data.imageUrl || null,
        date: data.date ? new Date(data.date) : null,
        participants: data.participants || [],
      },
    });

    return {
      ...created,
      type: created.type as ExperienceCategory,
    };
  }

  async update(id: string, data: UpdateExperienceDto): Promise<ExperienceEntity> {
    const updated = await prisma.experience.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.type && { type: data.type }),
        ...(data.description && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.date !== undefined && { date: data.date ? new Date(data.date) : null }),
        ...(data.participants && { participants: data.participants }),
      },
    });

    return {
      ...updated,
      type: updated.type as ExperienceCategory,
    };
  }

  async delete(id: string): Promise<boolean> {
    // La propuesta que la originó también se borra: si no, quedaría "aprobada" apuntando a nada
    await prisma.$transaction([
      prisma.memoryRequest.deleteMany({ where: { experienceId: id } }),
      prisma.experience.delete({ where: { id } }),
    ]);
    return true;
  }
}
