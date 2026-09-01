import { databaseIsHealthy } from "@/features/health/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const healthy = await databaseIsHealthy();
  return Response.json(
    { status: healthy ? "ok" : "unhealthy" },
    { status: healthy ? 200 : 503 },
  );
}
