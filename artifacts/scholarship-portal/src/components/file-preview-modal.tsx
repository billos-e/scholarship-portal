import { ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);

function isDataImage(url: string): boolean {
  return url.startsWith("data:image/");
}

function getExtension(url: string): string {
  try {
    const pathname = new URL(url, "http://x").pathname;
    const ext = pathname.split(".").pop() ?? "";
    return ext.toLowerCase();
  } catch {
    return "";
  }
}

type FilePreviewModalProps = {
  open: boolean;
  onClose: () => void;
  url: string;
  label: string;
};

export function FilePreviewModal({
  open,
  onClose,
  url,
  label,
}: FilePreviewModalProps) {
  const ext = getExtension(url);
  const isImage = IMAGE_EXTENSIONS.has(ext) || isDataImage(url);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="flex flex-col gap-0 overflow-hidden p-0"
        style={{ width: "75vw", maxWidth: "75vw", maxHeight: "90vh" }}
      >
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between gap-3 border-b px-5 py-3 pr-12">
          <DialogTitle className="truncate text-base font-semibold">
            {label}
          </DialogTitle>
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(
              "shrink-0 inline-flex items-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <ExternalLink className="mr-1.5 size-3.5" />
            Open in new tab
          </a>
        </DialogHeader>

        <div className="min-h-0 flex-1 bg-muted/30">
          {isImage ? (
            <img
              src={url}
              alt={label}
              className="h-full max-h-[80vh] w-full object-contain"
            />
          ) : (
            <iframe
              src={url}
              title={label}
              className="h-full w-full border-0"
              style={{ minHeight: "70vh" }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
