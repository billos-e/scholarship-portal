"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import { ExportDialog } from "@/components/export-dialog";
import { Button } from "@/components/ui/button";
import type { TableExportColumn } from "@/lib/export/table-columns";
import type { ExportRow, ExportSheet } from "@/lib/export/spreadsheet";

type TableExportButtonProps = {
  columns: TableExportColumn[];
  rows: ExportRow[];
  filename: string;
  sheetName?: string;
  extraSheets?: ExportSheet[];
  label?: string;
  disabled?: boolean;
};

export function TableExportButton({
  columns,
  rows,
  filename,
  sheetName,
  extraSheets,
  label = "Export",
  disabled = false,
}: TableExportButtonProps) {
  const [open, setOpen] = useState(false);
  const exportRows = useMemo(() => rows, [rows]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={disabled || exportRows.length === 0}
      >
        <Download />
        {label}
      </Button>
      <ExportDialog
        open={open}
        onOpenChange={setOpen}
        columns={columns}
        rows={exportRows}
        filename={filename}
        sheetName={sheetName}
        extraSheets={extraSheets}
      />
    </>
  );
}
