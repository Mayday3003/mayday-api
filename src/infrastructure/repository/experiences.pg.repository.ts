import type { IExperienceRepository } from '../../domain/repository/IExperience.repository.js';
import type { ExperienceEntity, ExperienceCategory, CreateExperienceDto, UpdateExperienceDto } from '../../domain/models/Experience.js';
import type { PaginatedResult } from '../../domain/models/Pagination.js';
import prisma from './client.js';

export class ExperiencePgRepository implements IExperienceRepository {
  async findPaginated(page: number = 1, limit: number = 10, search?: string, type?: string): Promise<PaginatedResult<ExperienceEntity>> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type && type !== 'todos') {
      where.type = type;
    }
    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
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
      },
    });

    if (!item) return null;

    return {
      ...item,
      type: item.type as ExperienceCategory,
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
    await prisma.experience.delete({ where: { id } });
    return true;
  }
}
