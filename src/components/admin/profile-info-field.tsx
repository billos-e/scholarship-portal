import { cn } from "@/lib/utils";

export function ProfileInfoField({
  label,
  value,
  children,
  className,
}: {
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
  className?: string;
}) {
  const empty =
    value === null || value === undefined || value === "";

  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-heading text-sm font-semibold text-foreground sm:text-[15px]">
        {children ??
          (empty ? (
            <span className="font-normal text-muted-foreground">—</span>
          ) : (
            value
          ))}
      </dd>
    </div>
  );
}

export function ProfileInfoGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </dl>
  );
}
