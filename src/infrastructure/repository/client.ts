import { PrismaClient } from '@prisma/client';

// Único punto del proyecto que crea el cliente de Prisma (patrón singleton)
class PrismaSingleton {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!PrismaSingleton.instance) {
      PrismaSingleton.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return PrismaSingleton.instance;
  }
}

const prisma = PrismaSingleton.getInstance();

export default prisma;
