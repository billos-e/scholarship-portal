"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopyableValueProps = {
  label: string;
  value: string | null;
  display?: string;
  mono?: boolean;
  className?: string;
};

export function CopyableValue({
  label,
  value,
  display,
  mono = false,
  className,
}: CopyableValueProps) {
  const [copied, setCopied] = useState(false);
  const shown = display ?? value;
  const canCopy = Boolean(value && value !== "—");

  async function copy() {
    if (!value || value === "—") return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied.`);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}.`);
    }
  }

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center gap-1.5">
        <p
          className={cn(
            "min-w-0 flex-1 text-sm font-medium text-foreground",
            mono && "font-mono tracking-wide",
          )}
        >
          {shown ?? "—"}
        </p>
        {canCopy ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={copy}
            aria-label={`Copy ${label.toLowerCase()}`}
          >
            {copied ? (
              <Check className="size-3.5 text-success" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
