import "server-only";
import prismaClientPackage from "@prisma/client";

const { PrismaClient } = prismaClientPackage;
type PrismaClientInstance = InstanceType<typeof PrismaClient>;
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientInstance;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
