import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

function createAuth() {
  const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";
  return betterAuth({
    appName: "Habit Shaper",
    baseURL:
      process.env.BETTER_AUTH_URL ??
      (isProductionBuild ? "http://build.invalid" : undefined),
    secret:
      process.env.BETTER_AUTH_SECRET ??
      (isProductionBuild
        ? "public-build-placeholder-that-is-never-used-at-runtime"
        : undefined),
    database: prismaAdapter(prisma, { provider: "mysql" }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      cookieCache: { enabled: false },
    },
    user: {
      additionalFields: {
        timeZone: {
          type: "string",
          required: true,
          input: true,
        },
      },
    },
    advanced: {
      useSecureCookies:
        process.env.BETTER_AUTH_URL?.startsWith("https://") ?? false,
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
      },
    },
    plugins: [nextCookies()],
  });
}

let auth: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  auth ??= createAuth();
  return auth;
}
