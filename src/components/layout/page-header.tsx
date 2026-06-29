import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  size?: "default" | "lg";
};

export function PageHeader({
  title,
  description,
  actions,
  className,
  size = "default",
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1
          className={cn(
            "font-heading font-bold tracking-tight",
            size === "lg" ? "text-[1.625rem] leading-tight" : "text-2xl",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
