import Link from "next/link";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProfileInfoCardProps = {
  title: string;
  editHref?: string;
  editLabel?: string;
  editVariant?: "primary" | "outline";
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function ProfileInfoCard({
  title,
  editHref,
  editLabel = "Edit",
  editVariant = "primary",
  headerAction,
  children,
  className,
}: ProfileInfoCardProps) {
  const editButton =
    editHref != null ? (
      <Button
        size="sm"
        variant={editVariant === "primary" ? "default" : "outline"}
        className={cn(
          editVariant === "primary" &&
            "bg-accent text-accent-foreground hover:bg-accent/90",
        )}
        render={<Link href={editHref} />}
      >
        <Pencil className="size-3.5" />
        {editLabel}
      </Button>
    ) : null;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-4 border-b border-border/50 px-6 py-5">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          {title}
        </h2>
        {headerAction ?? editButton}
      </header>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}
