import { IUserRepository, IExperienceRepository, IInteractionRepository } from '../../domain/repositories/index.js';
import { UserEntity, ExperienceEntity, InteractionEntity, UserRole, ExperienceCategory } from '../../domain/entities/index.js';
import { CreateExperienceDto, UpdateExperienceDto, PaginatedResult } from '../../domain/dtos/index.js';
import { prisma } from '../database/prisma.js';

export class PrismaUserRepository implements IUserRepository {
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
}

export class PrismaExperienceRepository implements IExperienceRepository {
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

export class PrismaInteractionRepository implements IInteractionRepository {
  async create(data: { content: string; userId: string; experienceId: string }): Promise<InteractionEntity> {
    const created = await prisma.interaction.create({
      data: {
        content: data.content,
        userId: data.userId,
        experienceId: data.experienceId,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        experience: { select: { id: true, title: true, type: true } },
      },
    });

    return {
      ...created,
      user: created.user ? { ...created.user, role: created.user.role as UserRole } : undefined,
      experience: created.experience ? { ...created.experience, type: created.experience.type as ExperienceCategory } : undefined,
    };
  }

  async findByUserId(userId: string): Promise<InteractionEntity[]> {
    const items = await prisma.interaction.findMany({
      where: { userId },
      include: {
        experience: { select: { id: true, title: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      ...item,
      experience: item.experience ? { ...item.experience, type: item.experience.type as ExperienceCategory } : undefined,
    }));
  }

  async findAll(): Promise<InteractionEntity[]> {
    const items = await prisma.interaction.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        experience: { select: { id: true, title: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      ...item,
      user: item.user ? { ...item.user, role: item.user.role as UserRole } : undefined,
      experience: item.experience ? { ...item.experience, type: item.experience.type as ExperienceCategory } : undefined,
    }));
  }

  async findById(id: string): Promise<InteractionEntity | null> {
    const item = await prisma.interaction.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        experience: { select: { id: true, title: true, type: true } },
      },
    });

    if (!item) return null;

    return {
      ...item,
      user: item.user ? { ...item.user, role: item.user.role as UserRole } : undefined,
      experience: item.experience ? { ...item.experience, type: item.experience.type as ExperienceCategory } : undefined,
    };
  }

  async delete(id: string): Promise<boolean> {
    await prisma.interaction.delete({ where: { id } });
    return true;
  }
}
