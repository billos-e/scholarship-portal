import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  size?: "default" | "lg";
  variant?: "default" | "admin";
};

export function PageHeader({
  title,
  description,
  actions,
  className,
  size = "default",
  variant = "default",
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        {variant === "admin" ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
            Administration
          </p>
        ) : null}
        <div
          className={cn(
            variant === "admin" && "border-l-[3px] border-primary/35 pl-4",
          )}
        >
          <h1
            className={cn(
              "font-heading font-bold tracking-tight",
              size === "lg" ? "text-[1.625rem] leading-tight" : "text-2xl",
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
