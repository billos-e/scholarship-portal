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
        <div>
          <h1
            className={cn(
              "font-heading font-bold tracking-tight",
              size === "lg"
                ? "text-xl leading-tight sm:text-[1.625rem]"
                : "text-xl sm:text-2xl",
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
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center [&_button]:w-full sm:[&_button]:w-auto [&_a]:w-full sm:[&_a]:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
