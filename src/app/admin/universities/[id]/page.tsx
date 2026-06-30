import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Pencil, Users } from "lucide-react";

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
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { SemesterTable } from "./semester-table";
import { DeactivateUniversityButton } from "./university-actions";

export default async function UniversityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const university = await prisma.university.findUnique({
    where: { id },
    include: {
      semesters: {
        orderBy: { startDate: "asc" },
        include: {
          _count: { select: { tuitionPaymentRequests: true } },
        },
      },
      students: {
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        take: 5,
      },
      _count: { select: { students: true } },
    },
  });

  if (!university) notFound();

  const studentCount = university._count.students;
  const semesterCount = university.semesters.length;
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
              studentCount === 0
                ? "None"
                : `${studentCount} on record`
            }
          />
          <ProfileInfoField
            label="Semesters configured"
            value={
              semesterCount === 0
                ? "None"
                : `${semesterCount} on record`
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
