import { ImportWizard } from "@/components/admin/import-wizard";
import { PageHeader } from "@/components/layout/page-header";
import { requireAdmin } from "@/lib/auth/session";

export default function AdminImportPage() {
  requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        variant="admin"
        title="Import data"
        description="Upload a spreadsheet and map columns to import students, universities, or payment records."
      />
      <ImportWizard />
    </div>
  );
}
