import "server-only";
import { prisma } from "@/lib/prisma";

export async function updateUserTimeZone(userId: string, timeZone: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { timeZone },
    select: { id: true },
  });
}
