import { auth } from "@/auth";
import {
  type ExportDataset,
  type ExportFilters,
  fetchExportRows,
} from "@/lib/export/datasets";
import {
  contentDisposition,
  rowsToCsv,
  rowsToXlsxBuffer,
} from "@/lib/export/spreadsheet";

const DATASETS = new Set<ExportDataset>(["students", "requests", "reports"]);
const FORMATS = new Set(["csv", "xlsx"]);

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dataset = searchParams.get("dataset") as ExportDataset | null;
  const format = searchParams.get("format") ?? "csv";

  if (!dataset || !DATASETS.has(dataset)) {
    return new Response("Invalid dataset. Use students, requests, or reports.", {
      status: 400,
    });
  }
  if (!FORMATS.has(format)) {
    return new Response("Invalid format. Use csv or xlsx.", { status: 400 });
  }

  const filters: ExportFilters = {
    q: searchParams.get("q")?.trim() || undefined,
    universityId: searchParams.get("uni") || searchParams.get("universityId") || undefined,
    status: searchParams.get("status") || undefined,
    semester: searchParams.get("semester") || undefined,
    semesterId: searchParams.get("semesterId") || undefined,
  };

  const rows = await fetchExportRows(dataset, filters);
  const stamp = new Date().toISOString().slice(0, 10);
  const baseName = `scholarship-${dataset}-${stamp}`;

  if (format === "xlsx") {
    const buffer = rowsToXlsxBuffer(rows, dataset);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": contentDisposition(`${baseName}.xlsx`),
        "Cache-Control": "no-store",
      },
    });
  }

  const csv = rowsToCsv(rows);
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": contentDisposition(`${baseName}.csv`),
      "Cache-Control": "no-store",
    },
  });
}
