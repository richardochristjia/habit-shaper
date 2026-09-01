import type { PrismaClient } from "@prisma/client";

/** Reset every table that can contain test-owned authentication or product data. */
export async function resetTestDatabase(client: PrismaClient): Promise<void> {
  await client.$transaction([
    client.verification.deleteMany(),
    // User deletion cascades through Sessions, Accounts, Habits, Goals,
    // Completions, and Relapses.
    client.user.deleteMany(),
  ]);
}
