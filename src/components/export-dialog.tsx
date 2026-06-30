"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  defaultTableColumnKeys,
  groupTableColumnsByTable,
  type TableExportColumn,
} from "@/lib/export/table-columns";
import { downloadExportFile, type ExportRow } from "@/lib/export/spreadsheet";
import { cn } from "@/lib/utils";

type ExportFormat = "csv" | "xlsx";

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: TableExportColumn[];
  rows: ExportRow[];
  filename: string;
  sheetName?: string;
  title?: string;
  description?: string;
};

export function ExportDialog({
  open,
  onOpenChange,
  columns,
  rows,
  filename,
  sheetName = "Export",
  title = "Export current page",
  description,
}: ExportDialogProps) {
  const groupedColumns = useMemo(
    () => groupTableColumnsByTable(columns),
    [columns],
  );
  const allKeys = useMemo(() => defaultTableColumnKeys(columns), [columns]);

  const [format, setFormat] = useState<ExportFormat>("csv");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(allKeys),
  );

  const resolvedDescription =
    description ??
    `Export ${rows.length} row${rows.length === 1 ? "" : "s"} from this page. Choose which table fields to include.`;

  const allSelected = selected.size === allKeys.length;
  const noneSelected = selected.size === 0;

  function handleOpenChange(next: boolean) {
    if (next) {
      setSelected(new Set(allKeys));
      setFormat("csv");
    }
    onOpenChange(next);
  }

  function toggleColumn(key: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function toggleTable(tableKeys: string[], checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const key of tableKeys) {
        if (checked) next.add(key);
        else next.delete(key);
      }
      return next;
    });
  }

  function setAll(checked: boolean) {
    setSelected(checked ? new Set(allKeys) : new Set());
  }

  function handleExport() {
    if (noneSelected) return;

    const selectedColumns = columns.filter((column) =>
      selected.has(column.key),
    );
    downloadExportFile(rows, selectedColumns, format, filename, sheetName);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-4 py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{resolvedDescription}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="export-select-all"
                checked={allSelected}
                onCheckedChange={(checked) => setAll(checked === true)}
              />
              <Label htmlFor="export-select-all">Select all fields</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="export-format" className="text-muted-foreground">
                Format
              </Label>
              <NativeSelect
                id="export-format"
                value={format}
                onChange={(event) =>
                  setFormat(event.target.value as ExportFormat)
                }
                className="h-8"
              >
                <option value="csv">CSV</option>
                <option value="xlsx">Excel</option>
              </NativeSelect>
            </div>
          </div>

          <div className="space-y-4">
            {groupedColumns.map((group) => {
              const tableKeys = group.columns.map((column) => column.key);
              const tableSelected = tableKeys.filter((key) => selected.has(key));
              const tableAllSelected = tableSelected.length === tableKeys.length;
              const tableSomeSelected =
                tableSelected.length > 0 && !tableAllSelected;

              return (
                <section key={group.table} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`export-table-${group.table}`}
                      checked={tableAllSelected}
                      indeterminate={tableSomeSelected}
                      onCheckedChange={(checked) =>
                        toggleTable(tableKeys, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`export-table-${group.table}`}
                      className="font-medium"
                    >
                      {group.table}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {tableSelected.length}/{tableKeys.length}
                    </span>
                  </div>

                  <div className="grid gap-2 pl-6 sm:grid-cols-2">
                    {group.columns.map((column) => {
                      const fieldId = `export-field-${column.key}`;
                      return (
                        <div key={column.key} className="flex items-start gap-2">
                          <Checkbox
                            id={fieldId}
                            checked={selected.has(column.key)}
                            onCheckedChange={(checked) =>
                              toggleColumn(column.key, checked === true)
                            }
                          />
                          <Label
                            htmlFor={fieldId}
                            className={cn(
                              "flex flex-col gap-0.5 font-normal leading-snug",
                            )}
                          >
                            <span>{column.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {column.column}
                            </span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <DialogFooter className="border-t">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={noneSelected || rows.length === 0}>
            <Download />
            Download {format === "csv" ? "CSV" : "Excel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
