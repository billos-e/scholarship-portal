import path from "node:path";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { readUpload } from "@/lib/uploads";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { path: segments } = await ctx.params;
  if (!segments?.length) {
    return new Response("Not found", { status: 404 });
  }

  const relPath = segments.map(decodeURIComponent).join("/");
  const resolved = await readUpload(relPath);
  if (!resolved) {
    return new Response("Not found", { status: 404 });
  }

  if (session.user.role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!student || student.id !== resolved.ownerStudentId) {
      return new Response("Forbidden", { status: 403 });
    }
  } else if (session.user.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const filename = path.basename(relPath);

  return new Response(resolved.body, {
    status: 200,
    headers: {
      "Content-Type": resolved.contentType,
      "Content-Length": String(resolved.size),
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
