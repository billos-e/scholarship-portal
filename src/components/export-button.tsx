import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ExportDataset } from "@/lib/export/datasets";

type ExportButtonProps = {
  dataset: ExportDataset;
  params?: Record<string, string | undefined>;
  label?: string;
};

export function ExportButton({
  dataset,
  params = {},
  label = "Export",
}: ExportButtonProps) {
  const search = new URLSearchParams({ dataset, format: "csv" });
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const href = `/api/admin/export?${search.toString()}`;

  return (
    <Button variant="outline" size="sm" render={<a href={href} download />}>
      <Download />
      {label}
    </Button>
  );
}
