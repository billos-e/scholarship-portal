import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { FileText } from "lucide-react";

import { FilePreviewModal, isFileImage } from "@/components/file-preview-modal";
import { uploadPublicUrl } from "@/lib/upload-path";
import { cn } from "@/lib/utils";

export function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | number | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-muted/25 px-4 py-3",
        className,
      )}
    >
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">
        {value === null || value === undefined || value === "" ? (
          <span className="font-normal text-muted-foreground">—</span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export function DetailFileLink({
  label,
  url,
  icon: Icon = FileText,
}: {
  label: string;
  url: string | null;
  icon?: LucideIcon;
}) {
  const [open, setOpen] = useState(false);

  if (!url) {
    return <DetailField label={label} />;
  }

  const resolvedUrl = uploadPublicUrl(url);

  return (
    <div className="rounded-lg border border-border/50 bg-muted/25 px-4 py-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1">
        <button
          type="button"
          onClick={() =>
            isFileImage(resolvedUrl)
              ? setOpen(true)
              : window.open(resolvedUrl, "_blank", "noopener,noreferrer")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
        >
          <Icon className="size-4 shrink-0" />
          View file
        </button>
      </dd>

      <FilePreviewModal
        open={open}
        onClose={() => setOpen(false)}
        url={resolvedUrl}
        label={label}
      />
    </div>
  );
}

export function DetailTags({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-foreground shadow-sm"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function WellbeingBar({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  const pct = value !== null ? (value / 5) * 100 : 0;

  return (
    <li className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-foreground">{label}</span>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
          {value !== null ? `${value}/5` : "—"}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={value ?? undefined}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            value === null && "w-0",
            value !== null && value <= 2 && "bg-warning",
            value !== null && value === 3 && "bg-accent",
            value !== null && value >= 4 && "bg-primary",
          )}
          style={value !== null ? { width: `${pct}%` } : undefined}
        />
      </div>
    </li>
  );
}
