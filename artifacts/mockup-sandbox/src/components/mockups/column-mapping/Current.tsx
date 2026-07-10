import { useState } from "react";
import './_group.css';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FIELDS, HEADERS, SAMPLE_ROWS, initialMapping } from "./data";

export function Current() {
  const [mapping, setMapping] = useState<Record<string, string>>(initialMapping());

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl rounded-xl border bg-card">
        <div className="border-b px-4 py-3 text-sm font-medium">
          Column mapping
        </div>
        <div className="space-y-4 px-4 pb-5 pt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label>
                  {field.label}
                  {field.required ? (
                    <span className="text-destructive"> *</span>
                  ) : null}
                </Label>
                <Select
                  value={mapping[field.key] ?? "__none__"}
                  onValueChange={(value) =>
                    setMapping((m) => ({ ...m, [field.key]: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Not mapped —</SelectItem>
                    {HEADERS.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Data preview
            </p>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {HEADERS.slice(0, 8).map((header) => (
                      <TableHead key={header} className="whitespace-nowrap">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SAMPLE_ROWS.map((row, index) => (
                    <TableRow key={index}>
                      {HEADERS.slice(0, 8).map((header) => (
                        <TableCell
                          key={header}
                          className="max-w-[220px] truncate whitespace-nowrap"
                        >
                          {row[header] || "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
