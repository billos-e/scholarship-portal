import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { UniversityEditPageForm } from "./university-edit-page-form";

export default async function UniversityEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const university = await prisma.university.findUnique({
    where: { id },
  });

  if (!university) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Universities", href: "/admin/universities" },
          { label: university.name, href: `/admin/universities/${id}` },
          { label: "Edit" },
        ]}
      />

      <UniversityEditPageForm
        profileHref={`/admin/universities/${id}`}
        university={{
          id: university.id,
          name: university.name,
          city: university.city,
          country: university.country,
          addressLine: university.addressLine,
          websiteUrl: university.websiteUrl,
          imageUrl: university.imageUrl,
          hasSummerSemester: university.hasSummerSemester,
          isActive: university.isActive,
          notes: university.notes,
        }}
      />
    </div>
  );
}
