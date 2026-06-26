import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EXPORT_DATASETS } from "@/lib/export/datasets";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminExportPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Export data</h1>
        <p className="text-muted-foreground">
          Download student profiles, payment requests, or semester reports as
          CSV or Excel files.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {EXPORT_DATASETS.map((dataset) => (
          <Card key={dataset.id}>
            <CardHeader>
              <CardTitle>{dataset.label}</CardTitle>
              <CardDescription>{dataset.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1"
                render={
                  <a
                    href={`/api/admin/export?dataset=${dataset.id}&format=csv`}
                    download
                  />
                }
              >
                <Download />
                CSV
              </Button>
              <Button
                className="flex-1"
                render={
                  <a
                    href={`/api/admin/export?dataset=${dataset.id}&format=xlsx`}
                    download
                  />
                }
              >
                <Download />
                Excel
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
