import Link from "next/link";
import type { Prisma, StudentStatus } from "@prisma/client";
import { Eye, Search } from "lucide-react";

import { ExportButton } from "@/components/export-button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";
import {
  buildPageUrl,
  pageOffset,
  parsePage,
  PAGE_SIZE,
  totalPages,
} from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { StudentStatusBadge } from "@/components/student-status-badge";
import { StudentCreateDialog } from "./student-create-dialog";

type SearchParams = {
  q?: string;
  uni?: string;
  status?: string;
  page?: string;
};

const STATUS_VALUES: StudentStatus[] = ["ACTIVE", "GRADUATED", "INACTIVE"];

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const q = params.q?.trim() ?? "";
  const uni = params.uni ?? "";
  const status = params.status ?? "";
  const page = parsePage(params.page);

  const where: Prisma.StudentWhereInput = {};
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { studentId: { contains: q, mode: "insensitive" } },
    ];
  }
  if (uni) where.universityId = uni;
  if (status && STATUS_VALUES.includes(status as StudentStatus)) {
    where.status = status as StudentStatus;
  }

  const filterParams = { q, uni, status };

  const [total, students, universities] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: pageOffset(page),
      take: PAGE_SIZE,
      include: { university: true, user: true },
    }),
    prisma.university.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const pages = totalPages(total);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Search, create, and manage student accounts."
        actions={
          <>
            <ExportButton dataset="students" params={filterParams} />
            <StudentCreateDialog universities={universities} />
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All students</CardTitle>
          <CardDescription>
            {total} matching student{total === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Search
              </label>
              <Input
                name="q"
                defaultValue={q}
                placeholder="Name or student ID"
              />
            </div>
            <div className="w-full space-y-1 sm:w-52">
              <label className="text-xs font-medium text-muted-foreground">
                University
              </label>
              <NativeSelect name="uni" defaultValue={uni}>
                <option value="">All universities</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="w-full space-y-1 sm:w-40">
              <label className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <NativeSelect name="status" defaultValue={status}>
                <option value="">All statuses</option>
                {STATUS_VALUES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <Button type="submit" variant="outline">
              <Search /> Filter
            </Button>
          </form>

          {students.length === 0 ? (
            <EmptyState title="No students match your filters" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>University</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Access</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/students/${s.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {s.firstName} {s.lastName}
                          </Link>
                        </TableCell>
                        <TableCell>{s.studentId ?? "—"}</TableCell>
                        <TableCell>{s.university?.name ?? "—"}</TableCell>
                        <TableCell>{s.degreeProgram ?? "—"}</TableCell>
                        <TableCell>
                          <StudentStatusBadge status={s.status} />
                        </TableCell>
                        <TableCell>
                          {s.user.isActive ? (
                            <Badge
                              variant="outline"
                              className="border-success/30 bg-success-light text-success"
                            >
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="outline">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            render={<Link href={`/admin/students/${s.id}`} />}
                          >
                            <Eye />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                currentPage={page}
                totalPages={pages}
                buildHref={(p) =>
                  buildPageUrl("/admin/students", filterParams, p)
                }
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
