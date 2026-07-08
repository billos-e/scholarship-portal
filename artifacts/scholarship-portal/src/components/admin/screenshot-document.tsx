import { useState } from "react";
import { Eye, ImageIcon } from "lucide-react";

import { FilePreviewModal } from "@/components/file-preview-modal";
import { uploadPublicUrl } from "@/lib/upload-path";
import { cn } from "@/lib/utils";

type ScreenshotDocumentProps = {
  url: string | null;
  className?: string;
};

export function ScreenshotDocument({ url, className }: ScreenshotDocumentProps) {
  const [open, setOpen] = useState(false);

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

  const resolvedUrl = uploadPublicUrl(url);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group flex w-full items-center gap-4 rounded-xl border border-border/80 bg-card px-5 py-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md",
          className,
        )}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-orange-light text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
          <ImageIcon className="size-5" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold text-foreground">Screenshot upload</p>
          <p className="text-xs text-muted-foreground">
            Payment screenshot submitted with this request
          </p>
        </div>
        <Eye className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      </button>

      <FilePreviewModal
        open={open}
        onClose={() => setOpen(false)}
        url={resolvedUrl}
        label="Screenshot upload"
      />
    </>
  );
}
