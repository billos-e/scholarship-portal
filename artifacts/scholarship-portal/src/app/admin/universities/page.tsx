"use client";

import { UniversitiesList } from "@/components/admin/universities-list";
import { requireAdmin } from "@/lib/auth/session";

export default function AdminUniversitiesPage() {
  requireAdmin();

  return <UniversitiesList />;
}
