"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, GraduationCap, BookOpen, Calendar, Mail, Phone } from "lucide-react";

import { ProfileInfoCard } from "@/components/admin/profile-info-card";
import {
  ProfileInfoField,
  ProfileInfoGrid,
} from "@/components/admin/profile-info-field";
import { StudentStatusBadge } from "@/components/student-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireStudent } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { getInitials } from "@/lib/initials";
import { uploadPublicUrl } from "@/lib/upload-path";
import { fetchStudent, type StudentDetail } from "@/lib/api/students";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/not-found";

export default function StudentProfilePage() {
  const { user, student: sessionStudent } = requireStudent();
  const [student, setStudent] = useState<StudentDetail | null | undefined>(
    undefined,
  );

  useEffect(() => {
    fetchStudent(sessionStudent.id)
      .then(setStudent)
      .catch(() => setStudent(null));
  }, [sessionStudent.id]);

  if (student === undefined) {
    return (
      <div className="flex gap-6">
        <Skeleton className="h-[420px] w-56 shrink-0 rounded-2xl" />
        <div className="flex flex-1 flex-col gap-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!student) return <NotFound />;

  const bank = student.bankInformation;
  const fullName = `${student.firstName} ${student.lastName}`;
  const initials = getInitials(fullName);
  const hasPhoto = Boolean(student.photoUrl?.trim());

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* ── Left sidebar ── */}
      <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-56">
        {/* Identity card */}
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <div className="flex flex-col items-center px-5 py-6 text-center">
            {/* Avatar */}
            <div
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-full",
                !hasPhoto &&
                  "flex items-center justify-center bg-primary text-2xl font-bold text-primary-foreground",
              )}
            >
              {hasPhoto ? (
                <Image
                  src={uploadPublicUrl(student.photoUrl!)}
                  alt={`${fullName} profile photo`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                initials
              )}
            </div>

            <p className="mt-3 font-heading text-base font-semibold text-foreground">
              {fullName}
            </p>
            <div className="mt-1">
              <StudentStatusBadge status={student.status} />
            </div>
            {student.studentId && (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {student.studentId}
              </p>
            )}

            <Button
              size="sm"
              className="mt-4 w-full bg-accent text-accent-foreground hover:bg-accent/90"
              render={<Link href="/student/profile/edit" />}
            >
              <Pencil className="size-3.5" />
              Edit profile
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        {(student.gpa || student.yearOfStudy || student.currentSemesterLabel) && (
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm divide-y divide-border/50">
            {[
              { icon: GraduationCap, label: "GPA", value: student.gpa?.toString() },
              { icon: BookOpen, label: "Year", value: student.yearOfStudy ? `Year ${student.yearOfStudy}` : null },
              { icon: Calendar, label: "Semester", value: student.currentSemesterLabel },
            ]
              .filter((s) => s.value)
              .map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="truncate text-xs font-semibold text-foreground">{value}</p>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Contact */}
        {(user.email || student.phone) && (
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm divide-y divide-border/50">
            {user.email && (
              <div className="flex items-start gap-2.5 px-4 py-3">
                <Mail className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <a
                  href={`mailto:${user.email}`}
                  className="break-all text-[11px] text-primary underline-offset-4 hover:underline"
                >
                  {user.email}
                </a>
              </div>
            )}
            {student.phone && (
              <div className="flex items-start gap-2.5 px-4 py-3">
                <Phone className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <p className="text-[11px] text-foreground">{student.phone}</p>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col gap-4">
        <ProfileInfoCard title="Academic information">
          <ProfileInfoGrid>
            <ProfileInfoField
              label="University"
              value={student.university?.name ?? null}
            />
            <ProfileInfoField
              label="Degree program"
              value={student.degreeProgram}
            />
            <ProfileInfoField
              label="Year of study"
              value={student.yearOfStudy}
            />
            <ProfileInfoField
              label="Current semester"
              value={student.currentSemesterLabel}
            />
            <ProfileInfoField
              label="GPA"
              value={student.gpa ? student.gpa.toString() : null}
            />
            <ProfileInfoField
              label="Member since"
              value={formatDate(student.createdAt)}
            />
          </ProfileInfoGrid>
        </ProfileInfoCard>

        <ProfileInfoCard title="Personal information">
          <ProfileInfoGrid>
            <ProfileInfoField label="First name" value={student.firstName} />
            <ProfileInfoField label="Last name" value={student.lastName} />
            <ProfileInfoField label="Student ID" value={student.studentId} />
            <ProfileInfoField label="Phone number" value={student.phone} />
            <ProfileInfoField label="Email address">
              <a
                href={`mailto:${user.email}`}
                className="text-primary underline-offset-4 transition-colors hover:underline"
              >
                {user.email}
              </a>
            </ProfileInfoField>
            <ProfileInfoField label="Account status">
              <StudentStatusBadge status={student.status} />
            </ProfileInfoField>
          </ProfileInfoGrid>
        </ProfileInfoCard>

        <ProfileInfoCard title="Bank information">
          {bank?.bankName || bank?.bankAccountNumber ? (
            <ProfileInfoGrid>
              <ProfileInfoField label="Bank name" value={bank.bankName} />
              <ProfileInfoField
                label="Account holder"
                value={bank.bankAccountName}
              />
              <ProfileInfoField
                label="Account number"
                value={bank.bankAccountNumber}
              />
              <ProfileInfoField
                label="PromptPay"
                value={bank.promptpayNumber}
              />
            </ProfileInfoGrid>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              No bank details on file.{" "}
              <Link
                href="/student/profile/edit"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Add bank information
              </Link>
            </p>
          )}
        </ProfileInfoCard>
      </div>
    </div>
  );
}
