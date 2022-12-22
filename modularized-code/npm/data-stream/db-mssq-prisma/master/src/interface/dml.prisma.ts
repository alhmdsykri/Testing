import { PrismaClient } from '@prisma/client'
export interface DMLPrisma<T> {
  sync(req: T, p: PrismaClient): any;
}