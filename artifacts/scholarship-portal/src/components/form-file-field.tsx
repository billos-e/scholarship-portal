"use client";

import { useRef, useState } from "react";
import { FileText, ImageIcon, Upload, X } from "lucide-react";

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

      <div
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center transition-colors",
          "hover:border-primary/35 hover:bg-primary/[0.03]",
          fileName && "border-primary/30 bg-primary/[0.04]",
        )}
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
          const file = event.dataTransfer.files?.[0];
          if (!file || !inputRef.current) return;
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          inputRef.current.files = dataTransfer.files;
          setFileName(file.name);
        }}
        role="button"
        tabIndex={0}
        aria-label={fileName ? `Selected file: ${fileName}` : label}
      >
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg transition-colors",
            fileName
              ? "bg-brand-fuchsia-light text-primary"
              : "bg-muted text-muted-foreground group-hover:bg-brand-fuchsia-light/70 group-hover:text-primary",
          )}
        >
          {fileName ? <Icon className="size-5" /> : <Upload className="size-5" />}
        </div>

        {fileName ? (
          <div className="flex max-w-full items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">
              {fileName}
            </p>
            <button
              type="button"
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation();
                clearFile();
              }}
              aria-label="Remove selected file"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">
              Choose a file or drag it here
            </p>
            {hint ? (
              <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </>
        )}

        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          accept={accept}
          required={required}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setFileName(file?.name ?? null);
          }}
        />
      </div>
    </div>
  );
}
