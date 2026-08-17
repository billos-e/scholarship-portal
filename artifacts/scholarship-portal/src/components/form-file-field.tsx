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
  multiple?: boolean;
  variant?: "document" | "image";
  className?: string;
};

function assignFiles(input: HTMLInputElement, files: File[]) {
  const dataTransfer = new DataTransfer();
  for (const file of files) dataTransfer.items.add(file);
  input.files = dataTransfer.files;
}

export function FormFileField({
  id,
  name,
  label,
  hint,
  accept,
  required,
  optional,
  multiple = false,
  variant = "document",
  className,
}: FormFileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const Icon = variant === "image" ? ImageIcon : FileText;

  function setFromFileList(list: FileList | File[] | null, assignToInput: boolean) {
    const files = list ? Array.from(list) : [];
    const next = multiple ? files : files.slice(0, 1);
    if (assignToInput && inputRef.current) assignFiles(inputRef.current, next);
    setFileNames(next.map((file) => file.name));
  }

  function clearFiles() {
    setFileNames([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  const selectedLabel =
    fileNames.length === 1
      ? fileNames[0]
      : `${fileNames.length} files selected`;

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

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => setFromFileList(event.target.files, false)}
      />

      {fileNames.length > 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/[0.04] px-4 py-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-fuchsia-light text-primary">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {selectedLabel}
            </p>
            {fileNames.length > 1 ? (
              <ul className="mt-1 space-y-0.5">
                {fileNames.map((fileName, index) => (
                  <li
                    key={`${fileName}-${index}`}
                    className="truncate text-xs text-muted-foreground"
                  >
                    {fileName}
                  </li>
                ))}
              </ul>
            ) : null}
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
                clearFiles();
              }}
              aria-label="Remove selected file"
            >
              <X className="size-3.5" />
            </button>
          </div>
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
            setFromFileList(event.dataTransfer.files, true);
          }}
          role="button"
          tabIndex={0}
          aria-label={label}
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-brand-fuchsia-light/70 group-hover:text-primary">
            <Upload className="size-5" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {multiple
              ? "Choose files or drag them here"
              : "Choose a file or drag it here"}
          </p>
          {hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
