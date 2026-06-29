import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Users } from "lucide-react";

import { ExportButton } from "@/components/export-button";
import { UniversityStudentsTable } from "@/components/admin/university-students-table";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { UniversityDialog } from "../university-dialog";
import { SemesterCreateForm } from "./semester-create-form";
import { SemesterTable } from "./semester-table";
import {
  DeactivateUniversityButton,
  UniversityImageForm,
} from "./university-actions";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">{value && value.length > 0 ? value : "—"}</dd>
    </div>
  );
}

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
      semesters: { orderBy: { startDate: "asc" } },
      students: {
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        take: 5,
      },
      _count: { select: { students: true } },
    },
  });

  if (!university) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Universities", href: "/admin/universities" },
          { label: university.name },
        ]}
      />

      <PageHeader
        title={university.name}
        description={
          [university.city, university.country].filter(Boolean).join(", ") ||
          "University profile"
        }
        actions={
          <>
            {university.isActive ? (
              <Badge
                variant="outline"
                className="border-success/30 bg-success-light text-success"
              >
                Active
              </Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            )}
            <UniversityDialog
              university={{
                id: university.id,
                name: university.name,
                city: university.city,
                country: university.country,
                addressLine: university.addressLine,
                websiteUrl: university.websiteUrl,
                hasSummerSemester: university.hasSummerSemester,
                isActive: university.isActive,
                notes: university.notes,
              }}
              trigger={
                <Button size="sm" variant="outline">
                  <Pencil />
                  Edit
                </Button>
              }
            />
            <DeactivateUniversityButton
              universityId={university.id}
              isActive={university.isActive}
            />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>University Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <UniversityImageForm
              universityId={university.id}
              imageUrl={university.imageUrl}
              name={university.name}
            />
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Address" value={university.addressLine} />
              <Field label="City" value={university.city} />
              <Field label="Country" value={university.country} />
              <Field
                label="Website"
                value={university.websiteUrl}
              />
              <Field
                label="Summer semester"
                value={university.hasSummerSemester ? "Yes" : "No"}
              />
              <Field label="Notes" value={university.notes} />
            </dl>
            {university.websiteUrl ? (
              <a
                href={university.websiteUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm font-medium text-primary hover:underline"
              >
                Visit website
              </a>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="justify-start"
              render={
                <Link href={`/admin/students?uni=${university.id}`} />
              }
            >
              <Users />
              View all students ({university._count.students})
            </Button>
            <ExportButton
              dataset="students"
              params={{ uni: university.id }}
              label="Export students"
            />
            <ExportButton
              dataset="requests"
              params={{ uni: university.id }}
              label="Export requests"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semester Calendar</CardTitle>
          <CardDescription>
            Manage active semesters for student submissions. Sorted by start date.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SemesterTable
            semesters={university.semesters}
            universityId={university.id}
          />
          <div className="border-t pt-6">
            <h3 className="mb-3 text-sm font-semibold">Add semester</h3>
            <SemesterCreateForm universityId={university.id} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Students</CardTitle>
            <CardDescription>
              {university._count.students} student
              {university._count.students === 1 ? "" : "s"} at this university.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/admin/students?uni=${university.id}`} />}
          >
            View all
          </Button>
        </CardHeader>
        <CardContent>
          {university.students.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students yet.</p>
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
        </CardContent>
      </Card>
    </div>
  );
}
