import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Eye, Search } from "lucide-react";

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
import { UniversityDialog } from "./university-dialog";

type SearchParams = {
  q?: string;
  status?: string;
  page?: string;
};

export default async function AdminUniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const q = params.q?.trim() ?? "";
  const status = params.status ?? "";
  const page = parsePage(params.page);

  const where: Prisma.UniversityWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { country: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const filterParams = { q, status };

  const [total, universities] = await Promise.all([
    prisma.university.count({ where }),
    prisma.university.findMany({
      where,
      orderBy: { name: "asc" },
      skip: pageOffset(page),
      take: PAGE_SIZE,
      include: {
        _count: { select: { students: true, semesters: true } },
      },
    }),
  ]);

  const pages = totalPages(total);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Universities"
        description="Manage partner universities and their semester calendars."
        actions={<UniversityDialog />}
      />

      <Card>
        <CardHeader>
          <CardTitle>All universities</CardTitle>
          <CardDescription>
            {total} universit{total === 1 ? "y" : "ies"} on record.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Search
              </label>
              <Input name="q" defaultValue={q} placeholder="Name or location" />
            </div>
            <div className="w-full space-y-1 sm:w-40">
              <label className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <NativeSelect name="status" defaultValue={status}>
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </NativeSelect>
            </div>
            <Button type="submit" variant="outline">
              <Search /> Filter
            </Button>
          </form>

          {universities.length === 0 ? (
            <EmptyState title="No universities match your filters" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Semesters</TableHead>
                      <TableHead>Summer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {universities.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/universities/${u.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {u.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {[u.city, u.country].filter(Boolean).join(", ") ||
                            "—"}
                        </TableCell>
                        <TableCell>{u._count.students}</TableCell>
                        <TableCell>{u._count.semesters}</TableCell>
                        <TableCell>
                          {u.hasSummerSemester ? "Yes" : "No"}
                        </TableCell>
                        <TableCell>
                          {u.isActive ? (
                            <Badge
                              variant="outline"
                              className="border-success/30 bg-success-light text-success"
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            render={
                              <Link href={`/admin/universities/${u.id}`} />
                            }
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
                  buildPageUrl("/admin/universities", filterParams, p)
                }
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
