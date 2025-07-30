import { PrismaClient } from "@prisma/client";

// Mencegah multiple instance Prisma Client di mode development
const globalPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'info'],
});

if (process.env.NODE_ENV !== 'production') globalPrisma.prisma = prisma;