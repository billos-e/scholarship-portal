import Link from "next/link";
import type { Prisma, StudentStatus } from "@prisma/client";
import { Pencil, Search } from "lucide-react";

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
import { prisma } from "@/lib/prisma";
import { StudentStatusBadge } from "@/components/student-status-badge";
import { StudentCreateDialog } from "./student-create-dialog";

type SearchParams = {
  q?: string;
  uni?: string;
  status?: string;
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

  const [students, universities] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: { university: true, user: true },
    }),
    prisma.university.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Search, create, and manage student accounts.
          </p>
        </div>
        <StudentCreateDialog universities={universities} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All students</CardTitle>
          <CardDescription>{students.length} matching student(s).</CardDescription>
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
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No students match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>University</TableHead>
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
                    <TableCell>
                      <StudentStatusBadge status={s.status} />
                    </TableCell>
                    <TableCell>
                      {s.user.isActive ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-100 text-emerald-800"
                        >
                          Enabled
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-slate-100 text-slate-600"
                        >
                          Disabled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link href={`/admin/students/${s.id}`} />}
                      >
                        <Pencil />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
