import { Download } from "lucide-react";

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

export function isFileImage(url: string): boolean {
  return IMAGE_EXTENSIONS.has(getExtension(url)) || isDataImage(url);
}

// Types the browser can actually render inline in a tab. Anything else
// (docx, xlsx, zip, octet-stream, ...) will just get silently downloaded by
// the browser if we try to navigate a tab to it, leaving that tab blank —
// so those need to go through a real download instead.
function isBrowserRenderable(contentType: string): boolean {
  return (
    contentType.startsWith("image/") ||
    contentType.startsWith("text/") ||
    contentType === "application/pdf"
  );
}

function triggerDownload(blobUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function openFileInNewTab(url: string, filename = "download"): void {
  if (!url.startsWith("data:")) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  // Open the tab synchronously (within the click handler) so browsers don't
  // treat it as a blocked popup, then point it at a blob: URL once ready —
  // most browsers refuse to top-level-navigate to a `data:` URL directly,
  // which otherwise results in a blank tab.
  const contentType = url.slice(5, url.indexOf(";")) || "";
  const tab = isBrowserRenderable(contentType)
    ? window.open("", "_blank", "noopener,noreferrer")
    : null;
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      if (isBrowserRenderable(blob.type)) {
        if (tab) {
          tab.location.href = blobUrl;
        } else {
          window.open(blobUrl, "_blank", "noopener,noreferrer");
        }
      } else {
        tab?.close();
        triggerDownload(blobUrl, filename);
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    })
    .catch(() => {
      if (tab) tab.location.href = url;
    });
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
            download={label}
            className={cn(
              "shrink-0 inline-flex items-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Download className="mr-1.5 size-3.5" />
            Download
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
