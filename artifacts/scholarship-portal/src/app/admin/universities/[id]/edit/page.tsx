"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/session";
import { fetchUniversity, type UniversityDetail } from "@/lib/api/universities";
import NotFound from "@/pages/not-found";
import { UniversityEditPageForm } from "./university-edit-page-form";

export default function UniversityEditPage() {
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
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!university) return <NotFound />;

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
