import { useState } from "react";
import './_group.css';
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
import { cn } from "@/lib/utils";
import { FIELDS, HEADERS, SAMPLE_ROWS, initialMapping } from "./data";

const SECTIONS: { title: string; keys: string[] }[] = [
  {
    title: "Identity",
    keys: ["email", "first_name", "last_name", "student_id", "phone"],
  },
  {
    title: "Academic",
    keys: [
      "university",
      "degree_program",
      "year_of_study",
      "current_semester",
      "gpa",
      "status",
    ],
  },
  {
    title: "Banking",
    keys: [
      "bank_account_name",
      "bank_account_number",
      "bank_name",
      "promptpay_number",
    ],
  },
];

export function SplitView() {
  const [mapping, setMapping] = useState<Record<string, string>>(initialMapping());
  const [activeHeader, setActiveHeader] = useState<string | null>(null);

  const fieldByKey = Object.fromEntries(FIELDS.map((f) => [f.key, f]));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex max-w-4xl gap-4 rounded-xl border bg-card">
        <div className="w-[280px] shrink-0 space-y-4 border-r px-4 py-4">
          <p className="text-sm font-medium">Column mapping</p>
          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </p>
              <div className="space-y-2">
                {section.keys.map((key) => {
                  const field = fieldByKey[key];
                  if (!field) return null;
                  const value = mapping[key] ?? "__none__";
                  return (
                    <div key={key} className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        {field.label}
                        {field.required ? (
                          <span className="text-destructive"> *</span>
                        ) : null}
                      </span>
                      <Select
                        value={value}
                        onValueChange={(v) =>
                          setMapping((m) => ({ ...m, [key]: v }))
                        }
                      >
                        <SelectTrigger
                          className="h-8 w-full text-xs"
                          onMouseEnter={() =>
                            setActiveHeader(value !== "__none__" ? value : null)
                          }
                          onMouseLeave={() => setActiveHeader(null)}
                        >
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1 space-y-2 py-4 pr-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Live data preview
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {HEADERS.map((header) => (
                    <TableHead
                      key={header}
                      className={cn(
                        "whitespace-nowrap transition-colors",
                        activeHeader === header && "bg-primary/10 text-primary",
                      )}
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {SAMPLE_ROWS.map((row, index) => (
                  <TableRow key={index}>
                    {HEADERS.map((header) => (
                      <TableCell
                        key={header}
                        className={cn(
                          "max-w-[160px] truncate whitespace-nowrap transition-colors",
                          activeHeader === header && "bg-primary/5",
                        )}
                      >
                        {row[header] || "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground">
            Hover a field's dropdown to highlight its matched column here.
          </p>
        </div>
      </div>
    </div>
  );
}
