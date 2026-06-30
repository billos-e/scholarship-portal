import Image from "next/image";
import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import type { StudentStatus } from "@prisma/client";

import { StudentStatusBadge } from "@/components/student-status-badge";
import { getInitials } from "@/lib/initials";
import { uploadPublicUrl } from "@/lib/upload-path";
import { cn } from "@/lib/utils";

type StudentDetailHeroProps = {
  firstName: string;
  lastName: string;
  studentIdNumber: string | null;
  universityId: string | null;
  universityName: string | null;
  degreeProgram: string | null;
  yearOfStudy: string | null;
  status: StudentStatus;
  photoUrl: string | null;
  headerAction?: React.ReactNode;
};

export function StudentDetailHero({
  firstName,
  lastName,
  studentIdNumber,
  universityId,
  universityName,
  degreeProgram,
  yearOfStudy,
  status,
  photoUrl,
  headerAction,
}: StudentDetailHeroProps) {
  const fullName = `${firstName} ${lastName}`;
  const initials = getInitials(fullName);
  const hasPhoto = Boolean(photoUrl?.trim());

  const academicSubtitle = [degreeProgram, yearOfStudy]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card px-6 py-6 shadow-sm sm:px-8 sm:py-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center">
          <div
            className={cn(
              "relative size-24 shrink-0 overflow-hidden rounded-full sm:size-28",
              !hasPhoto &&
                "flex items-center justify-center bg-primary text-3xl font-bold text-primary-foreground",
            )}
          >
            {hasPhoto ? (
              <Image
                src={uploadPublicUrl(photoUrl!)}
                alt={`${fullName} profile photo`}
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
                {fullName}
              </h1>
              <StudentStatusBadge status={status} />
            </div>

            {academicSubtitle ? (
              <p className="text-sm text-muted-foreground">{academicSubtitle}</p>
            ) : studentIdNumber ? (
              <p className="font-mono text-sm font-medium text-primary">
                {studentIdNumber}
              </p>
            ) : null}

            {universityName ? (
              <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0 text-accent" />
                {universityId ? (
                  <Link
                    href={`/admin/universities/${universityId}`}
                    className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    <Building2 className="size-3.5 shrink-0" />
                    {universityName}
                  </Link>
                ) : (
                  universityName
                )}
              </p>
            ) : null}
          </div>
        </div>

        {headerAction ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            {headerAction}
          </div>
        ) : null}
      </div>
    </section>
  );
}
