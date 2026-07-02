import { auth } from "@/auth";
import { buildXlsxBuffer } from "@/lib/export/xlsx";
import type { ExportSheet } from "@/lib/export/spreadsheet";
import { z } from "zod";

const exportCellSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

const exportSheetSchema = z.object({
  name: z.string().min(1).max(31),
  columns: z
    .array(
      z.object({
        key: z.string().min(1),
        label: z.string().min(1),
        table: z.string().optional(),
        column: z.string().optional(),
      }),
    )
    .min(1),
  rows: z.array(z.record(z.string(), exportCellSchema)),
  csvFilenameSuffix: z.string().optional(),
});

const exportBodySchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-zA-Z0-9._-]+$/),
  sheets: z.array(exportSheetSchema).min(1).max(10),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: z.infer<typeof exportBodySchema>;
  try {
    body = exportBodySchema.parse(await request.json());
  } catch {
    return new Response("Invalid export payload", { status: 400 });
  }

  const buffer = buildXlsxBuffer(body.sheets as ExportSheet[]);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${body.filename}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
