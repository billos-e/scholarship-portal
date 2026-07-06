"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, GraduationCap, Pencil, Users } from "lucide-react";

import { ProfileInfoCard } from "@/components/admin/profile-info-card";
import {
  ProfileInfoField,
  ProfileInfoGrid,
} from "@/components/admin/profile-info-field";
import { RequestSectionCard } from "@/components/admin/request-section-card";
import { UniversityDetailHero } from "@/components/admin/university-detail-hero";
import { UniversityStudentsTable } from "@/components/admin/university-students-table";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { fetchUniversity, type UniversityDetail } from "@/lib/api/universities";
import NotFound from "@/pages/not-found";
import { SemesterTable } from "./semester-table";
import { ProgramBoard } from "./program-board";
import { DeactivateUniversityButton } from "./university-actions";

export default function UniversityDetailPage() {
  requireAdmin();
  const { id } = useParams<{ id: string }>();
  const [university, setUniversity] = useState<UniversityDetail | null | undefined>(undefined);

  useEffect(() => {
    setUniversity(undefined);
    fetchUniversity(id)
      .then(setUniversity)
      .catch(() => setUniversity(null));
  }, [id]);

  if (university === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!university) return <NotFound />;

  const assignedProgramNames = new Set(university.assignedDegreePrograms);
  const studentCount = university._count.students;
  const semesterCount = university.semesters.length;
  const programCount = university.degreePrograms.length;
  const studentsHref = `/admin/students?uni=${university.id}`;
  const editHref = `/admin/universities/${id}/edit`;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Universities", href: "/admin/universities" },
          { label: university.name },
        ]}
      />

      <UniversityDetailHero
        name={university.name}
        city={university.city}
        country={university.country}
        imageUrl={university.imageUrl}
        isActive={university.isActive}
        hasSummerSemester={university.hasSummerSemester}
        studentCount={studentCount}
        semesterCount={semesterCount}
        headerAction={
          <>
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              render={<Link href={editHref} />}
            >
              <Pencil className="size-3.5" />
              Edit profile
            </Button>
            <DeactivateUniversityButton
              universityId={university.id}
              isActive={university.isActive}
            />
          </>
        }
      />

      <ProfileInfoCard title="University information">
        <ProfileInfoGrid>
          <ProfileInfoField label="Address" value={university.addressLine} />
          <ProfileInfoField label="City" value={university.city} />
          <ProfileInfoField label="Country" value={university.country} />
          <ProfileInfoField label="Summer semester">
            {university.hasSummerSemester ? "Yes" : "No"}
          </ProfileInfoField>
          <ProfileInfoField label="Website">
            {university.websiteUrl ? (
              <a
                href={university.websiteUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-primary underline-offset-4 transition-colors hover:underline"
              >
                {university.websiteUrl.replace(/^https?:\/\//, "")}
              </a>
            ) : null}
          </ProfileInfoField>
          <ProfileInfoField
            label="Partner since"
            value={formatDate(university.createdAt)}
          />
          <ProfileInfoField
            label="Students enrolled"
            value={
              studentCount === 0 ? "None" : `${studentCount} on record`
            }
          />
          <ProfileInfoField
            label="Semesters configured"
            value={
              semesterCount === 0 ? "None" : `${semesterCount} on record`
            }
          />
          <ProfileInfoField
            label="Notes"
            value={university.notes}
            className="sm:col-span-2 lg:col-span-3"
          />
        </ProfileInfoGrid>
      </ProfileInfoCard>

      <RequestSectionCard
        title="Degree programs"
        description={
          programCount === 0
            ? "No degree programs configured yet."
            : `${programCount} program${programCount === 1 ? "" : "s"} · drag between Active and Inactive.`
        }
        icon={GraduationCap}
        tone="accent"
      >
        <ProgramBoard
          programs={university.degreePrograms.map((program) => ({
            id: program.id,
            name: program.name,
            isActive: program.isActive,
            canDelete: !assignedProgramNames.has(program.name.toLowerCase()),
          }))}
          universityId={university.id}
        />
      </RequestSectionCard>

      <RequestSectionCard
        title="Semester calendar"
        description={
          semesterCount === 0
            ? "No semesters configured yet."
            : `${semesterCount} semester${semesterCount === 1 ? "" : "s"} on record. Sorted by start date.`
        }
        icon={CalendarDays}
        tone="primary"
      >
        <SemesterTable
          semesters={university.semesters.map((semester) => ({
            id: semester.id,
            label: semester.label,
            academicYear: semester.academicYear,
            termCode: semester.termCode,
            startDate: semester.startDate,
            endDate: semester.endDate,
            isActive: semester.isActive,
            canDelete: semester._count.tuitionPaymentRequests === 0,
          }))}
          universityId={university.id}
        />
      </RequestSectionCard>

      <RequestSectionCard
        title="Students"
        titleHref={studentCount > 0 ? studentsHref : undefined}
        description={
          studentCount === 0
            ? "No students enrolled at this university."
            : `${studentCount} student${studentCount === 1 ? "" : "s"} enrolled. Showing up to 5.`
        }
        icon={Users}
        tone="accent"
      >
        {university.students.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            No students are enrolled at this university yet.
          </p>
        ) : (
          <UniversityStudentsTable
            rows={university.students.map((student) => ({
              id: student.id,
              name: `${student.firstName} ${student.lastName}`,
              studentId: student.studentId,
              status: student.status,
            }))}
          />
        )}
      </RequestSectionCard>
    </div>
  );
}
