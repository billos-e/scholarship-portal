import Image from "next/image";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/initials";
import { uploadPublicUrl } from "@/lib/upload-path";
import { cn } from "@/lib/utils";

type UniversityDetailHeroProps = {
  name: string;
  city: string | null;
  country: string | null;
  imageUrl: string | null;
  isActive: boolean;
  hasSummerSemester: boolean;
  studentCount: number;
  semesterCount: number;
  headerAction?: React.ReactNode;
};

export function UniversityDetailHero({
  name,
  city,
  country,
  imageUrl,
  isActive,
  hasSummerSemester,
  studentCount,
  semesterCount,
  headerAction,
}: UniversityDetailHeroProps) {
  const initials = getInitials(name);
  const hasImage = Boolean(imageUrl?.trim());
  const location = [city, country].filter(Boolean).join(", ");

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center">
            <div
              className={cn(
                "relative size-24 shrink-0 overflow-hidden rounded-2xl sm:size-28",
                !hasImage &&
                  "flex items-center justify-center bg-primary text-3xl font-bold text-primary-foreground",
              )}
            >
              {hasImage ? (
                <Image
                  src={uploadPublicUrl(imageUrl!)}
                  alt={`${name} logo`}
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
                  {name}
                </h1>
                {isActive ? (
                  <Badge
                    variant="outline"
                    className="border-success/30 bg-success-light text-success"
                  >
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>

              {location ? (
                <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0 text-accent" />
                  {location}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5 shrink-0" />
                  {studentCount} student{studentCount === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 shrink-0" />
                  {semesterCount} semester{semesterCount === 1 ? "" : "s"}
                </span>
                <span>
                  Summer term: {hasSummerSemester ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {headerAction ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
              {headerAction}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
