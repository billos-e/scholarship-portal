"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type SearchFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export function SearchField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: SearchFieldProps) {
  return (
    <div className="min-w-0 flex-1 space-y-1">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          className="border-border/80 bg-background pl-9 shadow-xs"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
