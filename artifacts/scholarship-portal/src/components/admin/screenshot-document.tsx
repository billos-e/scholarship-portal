import { ExternalLink, ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ScreenshotDocumentProps = {
  url: string | null;
  className?: string;
};

export function ScreenshotDocument({ url, className }: ScreenshotDocumentProps) {
  if (!url) {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 px-5 py-4",
          className,
        )}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <ImageIcon className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Screenshot upload
          </p>
          <p className="text-xs text-muted-foreground/80">No file uploaded</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={`/api/uploads/${url}`}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "group flex items-center gap-4 rounded-xl border border-border/80 bg-card px-5 py-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md",
        className,
      )}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-orange-light text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
        <ImageIcon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">Screenshot upload</p>
        <p className="text-xs text-muted-foreground">
          Payment screenshot submitted with this request
        </p>
      </div>
      <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
    </a>
  );
}
