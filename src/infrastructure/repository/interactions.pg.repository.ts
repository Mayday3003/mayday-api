import type { IInteractionRepository } from '../../domain/repository/IInteraction.repository.js';
import type { InteractionEntity } from '../../domain/models/Interaction.js';
import type { UserRole } from '../../domain/models/User.js';
import type { ExperienceCategory } from '../../domain/models/Experience.js';
import prisma from './client.js';

export class InteractionPgRepository implements IInteractionRepository {
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
