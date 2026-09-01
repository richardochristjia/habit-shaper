import "server-only";
import { prisma } from "@/lib/prisma";

export async function databaseIsHealthy(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
