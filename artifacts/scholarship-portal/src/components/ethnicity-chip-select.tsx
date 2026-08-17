"use client";

import { useState } from "react";

import { ETHNICITY_OPTIONS } from "@/lib/ethnicity-options";
import { cn } from "@/lib/utils";

export function EthnicityChipSelect({
  name = "ethnicity",
  defaultSelected,
  onSelectionChange,
}: {
  name?: string;
  defaultSelected?: string[];
  onSelectionChange?: (values: string[]) => void;
}) {
  const extras = (defaultSelected ?? []).filter(
    (value) => !(ETHNICITY_OPTIONS as readonly string[]).includes(value),
  );
  const options = extras.length
    ? [...ETHNICITY_OPTIONS, ...extras]
    : ETHNICITY_OPTIONS;
  const [selected, setSelected] = useState<Set<string>>(
    new Set(defaultSelected),
  );

  function toggle(value: string) {
    const next = new Set(selected);
    next.has(value) ? next.delete(value) : next.add(value);
    setSelected(next);
    onSelectionChange?.([...next]);
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Ethnicity">
      {selected.size > 0 &&
        [...selected].map((value) => (
          <input key={value} type="hidden" name={name} value={value} />
        ))}
      {options.map((opt) => {
        const active = selected.has(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-medium transition-all",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
            aria-pressed={active}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
