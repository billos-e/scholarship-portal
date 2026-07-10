import { useState } from "react";
import { Check } from "lucide-react";
import './_group.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FIELDS, HEADERS, SAMPLE_ROWS, initialMapping } from "./data";

export function CompactList() {
  const [mapping, setMapping] = useState<Record<string, string>>(initialMapping());
  const mappedCount = Object.values(mapping).filter((v) => v && v !== "__none__").length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-xl rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-medium">Column mapping</span>
          <span className="text-xs text-muted-foreground">
            {mappedCount}/{FIELDS.length} mapped
          </span>
        </div>
        <div className="divide-y">
          {FIELDS.map((field) => {
            const value = mapping[field.key] ?? "__none__";
            const sample =
              value !== "__none__" ? SAMPLE_ROWS[0]?.[value] : undefined;
            return (
              <div
                key={field.key}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <div className="flex w-40 shrink-0 items-center gap-1.5">
                  {value !== "__none__" ? (
                    <Check className="size-3.5 shrink-0 text-success" />
                  ) : (
                    <span className="size-3.5 shrink-0" />
                  )}
                  <span className="truncate text-sm">
                    {field.label}
                    {field.required ? (
                      <span className="text-destructive"> *</span>
                    ) : null}
                  </span>
                </div>
                <Select
                  value={value}
                  onValueChange={(v) =>
                    setMapping((m) => ({ ...m, [field.key]: v }))
                  }
                >
                  <SelectTrigger className="h-8 flex-1 text-sm">
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
                <span className="w-28 shrink-0 truncate text-right text-xs text-muted-foreground">
                  {sample ?? "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
