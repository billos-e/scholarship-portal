import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { FileText } from "lucide-react";

import { FilePreviewModal, isFileImage, openFileInNewTab } from "@/components/file-preview-modal";
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
  url: string | string[] | null;
  icon?: LucideIcon;
}) {
  const [preview, setPreview] = useState<{ url: string; label: string } | null>(
    null,
  );

  const urls = (Array.isArray(url) ? url : url ? [url] : []).filter(Boolean);

  if (urls.length === 0) {
    return <DetailField label={label} />;
  }

  return (
    <div className="rounded-lg border border-border/50 bg-muted/25 px-4 py-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 flex flex-col items-start gap-1.5">
        {urls.map((raw, index) => {
          const resolvedUrl = uploadPublicUrl(raw);
          const itemLabel =
            urls.length > 1 ? `${label} ${index + 1}` : label;
          return (
            <button
              key={`${raw}-${index}`}
              type="button"
              onClick={() =>
                isFileImage(resolvedUrl)
                  ? setPreview({ url: resolvedUrl, label: itemLabel })
                  : openFileInNewTab(resolvedUrl, itemLabel)
              }
              className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
            >
              <Icon className="size-4 shrink-0" />
              {urls.length > 1 ? `View file ${index + 1}` : "View file"}
            </button>
          );
        })}
      </dd>

      <FilePreviewModal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        url={preview?.url ?? ""}
        label={preview?.label ?? label}
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
