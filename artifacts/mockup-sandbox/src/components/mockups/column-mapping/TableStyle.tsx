import { useState } from "react";
import './_group.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FIELDS, HEADERS, SAMPLE_ROWS, initialMapping } from "./data";

export function TableStyle() {
  const [mapping, setMapping] = useState<Record<string, string>>(initialMapping());

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl rounded-xl border bg-card">
        <div className="border-b px-4 py-3 text-sm font-medium">
          Column mapping
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2 text-left font-medium">Target field</th>
              <th className="px-4 py-2 text-left font-medium">Source column</th>
              <th className="px-4 py-2 text-left font-medium">Sample</th>
            </tr>
          </thead>
          <tbody>
            {FIELDS.map((field, i) => {
              const value = mapping[field.key] ?? "__none__";
              const sample =
                value !== "__none__" ? SAMPLE_ROWS[0]?.[value] : undefined;
              return (
                <tr
                  key={field.key}
                  className={i % 2 === 1 ? "bg-muted/10" : undefined}
                >
                  <td className="whitespace-nowrap px-4 py-2">
                    {field.label}
                    {field.required ? (
                      <span className="text-destructive"> *</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2">
                    <Select
                      value={value}
                      onValueChange={(v) =>
                        setMapping((m) => ({ ...m, [field.key]: v }))
                      }
                    >
                      <SelectTrigger className="h-8 w-44 text-xs">
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
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-2 text-xs text-muted-foreground">
                    {sample ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
