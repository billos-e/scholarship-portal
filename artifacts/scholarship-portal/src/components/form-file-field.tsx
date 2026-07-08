"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileText, ImageIcon, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";

type FormFileFieldProps = {
  id: string;
  name: string;
  label: string;
  hint?: string;
  accept: string;
  required?: boolean;
  optional?: boolean;
  variant?: "document" | "image";
  className?: string;
};

export function FormFileField({
  id,
  name,
  label,
  hint,
  accept,
  required,
  optional,
  variant = "document",
  className,
}: FormFileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const Icon = variant === "image" ? ImageIcon : FileText;

  function clearFile() {
    setFileName(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="text-sm font-medium leading-none">
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
        {optional ? (
          <span className="font-normal text-muted-foreground"> (optional)</span>
        ) : null}
      </label>

      {fileName ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-primary/30 bg-primary/[0.04] px-4 py-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-fuchsia-light text-primary">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{fileName}</p>
            <button
              type="button"
              className="text-xs text-primary/70 underline-offset-2 hover:underline"
              onClick={() => inputRef.current?.click()}
            >
              Click to replace
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <CheckCircle2 className="size-4 text-primary" />
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation();
                clearFile();
              }}
              aria-label="Remove selected file"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="file"
            accept={accept}
            required={required}
            className="sr-only"
            onChange={(event) => {
              const f = event.target.files?.[0];
              setFileName(f?.name ?? null);
            }}
          />
        </div>
      ) : (
        <div
          className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center transition-colors hover:border-primary/35 hover:bg-primary/[0.03]"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onDrop={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const f = event.dataTransfer.files?.[0];
            if (!f || !inputRef.current) return;
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(f);
            inputRef.current.files = dataTransfer.files;
            setFileName(f.name);
          }}
          role="button"
          tabIndex={0}
          aria-label={label}
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-brand-fuchsia-light/70 group-hover:text-primary">
            <Upload className="size-5" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Choose a file or drag it here
          </p>
          {hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="file"
            accept={accept}
            required={required}
            className="sr-only"
            onChange={(event) => {
              const f = event.target.files?.[0];
              setFileName(f?.name ?? null);
            }}
          />
        </div>
      )}
    </div>
  );
}
