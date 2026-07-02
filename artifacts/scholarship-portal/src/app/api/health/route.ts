import { prisma } from "@/lib/prisma";
import { isDatabaseUnavailable } from "@/lib/db/errors";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true, database: "up" });
  } catch (error) {
    const status = isDatabaseUnavailable(error) ? 503 : 500;
    return Response.json(
      { ok: false, database: status === 503 ? "unavailable" : "error" },
      { status },
    );
  }
}
