import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { UniversityDialog } from "./university-dialog";

export default async function AdminUniversitiesPage() {
  await requireAdmin();

  const universities = await prisma.university.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { students: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Universities</h1>
          <p className="text-muted-foreground">
            Manage partner universities used across student profiles.
          </p>
        </div>
        <UniversityDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All universities</CardTitle>
          <CardDescription>
            {universities.length} universit
            {universities.length === 1 ? "y" : "ies"} on record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {universities.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No universities yet. Add your first one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Summer term</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12 text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {universities.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.hasSummerSemester ? "Yes" : "No"}</TableCell>
                    <TableCell>{u._count.students}</TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-100 text-emerald-800"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-slate-100 text-slate-600"
                        >
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <UniversityDialog
                        university={{
                          id: u.id,
                          name: u.name,
                          hasSummerSemester: u.hasSummerSemester,
                          isActive: u.isActive,
                          notes: u.notes,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
