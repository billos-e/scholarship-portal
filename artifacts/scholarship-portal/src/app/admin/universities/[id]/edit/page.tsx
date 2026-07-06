import { useParams } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { requireAdmin } from "@/lib/auth/session";
import { getUniversity } from "@/lib/stub/sample-data";
import NotFound from "@/pages/not-found";
import { UniversityEditPageForm } from "./university-edit-page-form";

export default function UniversityEditPage() {
  requireAdmin();
  const { id } = useParams<{ id: string }>();

  const university = getUniversity(id);

  if (!university) return <NotFound />;

  return (
    <div className="flex h-full flex-col space-y-6">
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
