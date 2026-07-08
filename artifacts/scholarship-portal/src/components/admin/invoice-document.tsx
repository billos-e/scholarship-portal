import { useState } from "react";
import { Eye, FileText } from "lucide-react";

import { FilePreviewModal } from "@/components/file-preview-modal";
import { uploadPublicUrl } from "@/lib/upload-path";
import { cn } from "@/lib/utils";

type InvoiceDocumentProps = {
  url: string | null;
  className?: string;
};

export function InvoiceDocument({ url, className }: InvoiceDocumentProps) {
  const [open, setOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  if (!url) {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 px-5 py-4",
          className,
        )}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <FileText className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Invoice upload
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
          "group flex w-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md",
          className,
        )}
      >
        <div className="relative h-44 w-full overflow-hidden bg-muted/30">
          {!imgFailed ? (
            <img
              src={resolvedUrl}
              alt="Invoice preview"
              className="h-full w-full object-cover object-top transition-transform group-hover:scale-[1.02]"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <FileText className="size-10 opacity-40" />
              <p className="text-xs opacity-60">PDF document</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="flex items-center gap-3 border-t border-border/60 px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-fuchsia-light text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <FileText className="size-4" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">Invoice upload</p>
            <p className="text-xs text-muted-foreground">Click to view full document</p>
          </div>
          <Eye className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
      </button>

      <FilePreviewModal
        open={open}
        onClose={() => setOpen(false)}
        url={resolvedUrl}
        label="Invoice upload"
      />
    </>
  );
}
