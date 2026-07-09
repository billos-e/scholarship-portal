import { useState } from "react";
import { Eye, ImageIcon } from "lucide-react";

import { FilePreviewModal, isFileImage, openFileInNewTab } from "@/components/file-preview-modal";
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
        onClick={() =>
          isFileImage(resolvedUrl)
            ? setOpen(true)
            : openFileInNewTab(resolvedUrl, "Screenshot upload")
        }
        className={cn(
          "group flex w-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md",
          className,
        )}
      >
        <div className="relative h-44 w-full overflow-hidden bg-muted/30">
          <img
            src={resolvedUrl}
            alt="Payment screenshot preview"
            className="h-full w-full object-cover object-top transition-transform group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="flex items-center gap-3 border-t border-border/60 px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-orange-light text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
            <ImageIcon className="size-4" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">Screenshot upload</p>
            <p className="text-xs text-muted-foreground">Click to view full image</p>
          </div>
          <Eye className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
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
