"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { CopyableValue } from "@/components/admin/copyable-value";
import {
  commitImportData,
  parseImportFile,
  validateImportData,
} from "@/lib/actions/import";
import { getImportEntityLabel, getImportFields, getUniversityDegreeProgramImportFields, getUniversitySemesterImportFields } from "@/lib/import/fields";
import type {
  ColumnMapping,
  ImportCommitResult,
  ImportEntity,
  ImportFieldDef,
  ImportPreviewResult,
  UniversitiesImportPreview,
} from "@/lib/import/types";
import {
  downloadBlob,
  generateCsvBlob,
  generateExcelBlob,
  generateUniversitiesZipBlob,
} from "@/lib/import/templates";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ENTITIES: ImportEntity[] = ["students", "universities", "payments"];

const STEPS = ["Type", "Upload", "Map columns", "Preview", "Done"] as const;
type Step = (typeof STEPS)[number];

const ENTITY_DESCRIPTIONS: Record<ImportEntity, string> = {
  students:
    "Create student accounts with profile and optional bank details. Existing emails are skipped.",
  universities:
    "Create or update universities by name or ID. Excel/ZIP exports with Semesters and Degree programs sheets are imported together.",
  payments:
    "Record payments against existing tuition requests. Use Request ID from exports, or student ID + semester.",
};

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls"];
const UNIVERSITY_ZIP_EXTENSION = ".zip";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UniversityZipInfo({ disabled, onDownload }: { disabled: boolean; onDownload: () => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
        >
          <Download className="size-3.5" />
          ZIP
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <p className="text-sm font-medium">ZIP structure</p>
          <p className="text-xs text-muted-foreground">
            The ZIP file must contain three CSV files:
          </p>
          <ul className="space-y-2 text-xs">
            <li>
              <span className="font-mono font-medium">universities.csv</span>
              <span className="text-muted-foreground"> — ID, Name, City, Country, Address, Website, Summer semester, Active status, Notes</span>
            </li>
            <li>
              <span className="font-mono font-medium">semesters.csv</span>
              <span className="text-muted-foreground"> — University ID, University, Academic year, Term, Label, Start date, End date, Status</span>
            </li>
            <li>
              <span className="font-mono font-medium">degree-programs.csv</span>
              <span className="text-muted-foreground"> — University ID, University, Name, Status</span>
            </li>
          </ul>
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={onDownload}
          >
            <Download className="size-3.5" />
            Download sample ZIP
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function isAcceptedImportFile(file: File, entity: ImportEntity | null): boolean {
  const name = file.name.toLowerCase();
  if (ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return true;
  }
  return entity === "universities" && name.endsWith(UNIVERSITY_ZIP_EXTENSION);
}

export function ImportWizard() {
  const [step, setStep] = useState<Step>("Type");
  const [entity, setEntity] = useState<ImportEntity | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [sampleRows, setSampleRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [semesterHeaders, setSemesterHeaders] = useState<string[]>([]);
  const [semesterRows, setSemesterRows] = useState<Record<string, string>[]>([]);
  const [semesterSampleRows, setSemesterSampleRows] = useState<
    Record<string, string>[]
  >([]);
  const [semesterMapping, setSemesterMapping] = useState<ColumnMapping>({});
  const [degreeProgramHeaders, setDegreeProgramHeaders] = useState<string[]>([]);
  const [degreeProgramRows, setDegreeProgramRows] = useState<Record<string, string>[]>([]);
  const [degreeProgramSampleRows, setDegreeProgramSampleRows] = useState<
    Record<string, string>[]
  >([]);
  const [degreeProgramMapping, setDegreeProgramMapping] = useState<ColumnMapping>({});
  const [preview, setPreview] = useState<
    ImportPreviewResult | UniversitiesImportPreview | null
  >(null);
  const [commitResult, setCommitResult] = useState<ImportCommitResult | null>(
    null,
  );
  const [studentPassword, setStudentPassword] = useState("");
  const [error, setError] = useState<string>();
  const [isDragging, setIsDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fields = useMemo(
    () => (entity ? getImportFields(entity) : []),
    [entity],
  );
  const semesterFields = useMemo(() => getUniversitySemesterImportFields(), []);
  const degreeProgramFields = useMemo(
    () => getUniversityDegreeProgramImportFields(),
    [],
  );
  const hasSemesterSheet = semesterRows.length > 0;
  const hasDegreeProgramSheet = degreeProgramRows.length > 0;
  const semesterPreview =
    preview && "semesters" in preview ? preview.semesters ?? null : null;
  const degreeProgramPreview =
    preview && "degreePrograms" in preview ? preview.degreePrograms ?? null : null;

  const stepIndex = STEPS.indexOf(step);

  function resetAfterEntityChange(next: ImportEntity) {
    setEntity(next);
    setFile(null);
    setHeaders([]);
    setRows([]);
    setSampleRows([]);
    setMapping({});
    setSemesterHeaders([]);
    setSemesterRows([]);
    setSemesterSampleRows([]);
    setSemesterMapping({});
    setDegreeProgramHeaders([]);
    setDegreeProgramRows([]);
    setDegreeProgramSampleRows([]);
    setDegreeProgramMapping({});
    setPreview(null);
    setCommitResult(null);
    setStudentPassword("");
    setError(undefined);
  }

  function goTo(next: Step) {
    setError(undefined);
    setStep(next);
  }

  function handleUpload() {
    if (!entity || !file) return;
    setError(undefined);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("entity", entity);
      formData.set("file", file);

      const result = await parseImportFile(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      setHeaders(result.headers);
      setRows(result.rows);
      setSampleRows(result.sampleRows);
      setMapping(result.suggestedMapping);
      if (result.semesterSheet) {
        setSemesterHeaders(result.semesterSheet.headers);
        setSemesterRows(result.semesterSheet.rows);
        setSemesterSampleRows(result.semesterSheet.sampleRows);
        setSemesterMapping(result.semesterSheet.suggestedMapping);
      } else {
        setSemesterHeaders([]);
        setSemesterRows([]);
        setSemesterSampleRows([]);
        setSemesterMapping({});
      }
      if (result.degreeProgramSheet) {
        setDegreeProgramHeaders(result.degreeProgramSheet.headers);
        setDegreeProgramRows(result.degreeProgramSheet.rows);
        setDegreeProgramSampleRows(result.degreeProgramSheet.sampleRows);
        setDegreeProgramMapping(result.degreeProgramSheet.suggestedMapping);
      } else {
        setDegreeProgramHeaders([]);
        setDegreeProgramRows([]);
        setDegreeProgramSampleRows([]);
        setDegreeProgramMapping({});
      }
      goTo("Map columns");
      const extraNotes = [
        result.semesterSheet
          ? `${result.semesterSheet.rowCount} semester row(s)`
          : null,
        result.degreeProgramSheet
          ? `${result.degreeProgramSheet.rowCount} degree program row(s)`
          : null,
      ]
        .filter(Boolean)
        .join(" and ");
      const secondaryNote = extraNotes ? ` Found ${extraNotes} too.` : "";
      toast.success(`Parsed ${result.rowCount} university row(s).${secondaryNote}`);
    });
  }

  function handlePreview() {
    if (!entity) return;
    setError(undefined);

    startTransition(async () => {
      const result = await validateImportData(entity, mapping, rows, {
        semesterMapping: hasSemesterSheet ? semesterMapping : undefined,
        semesterRows: hasSemesterSheet ? semesterRows : undefined,
        degreeProgramMapping: hasDegreeProgramSheet
          ? degreeProgramMapping
          : undefined,
        degreeProgramRows: hasDegreeProgramSheet ? degreeProgramRows : undefined,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setPreview(result);
      goTo("Preview");
    });
  }

  function handleCommit() {
    if (!entity) return;
    setError(undefined);

    startTransition(async () => {
      const result = await commitImportData(entity, mapping, rows, {
        password: studentPassword || undefined,
        semesterMapping: hasSemesterSheet ? semesterMapping : undefined,
        semesterRows: hasSemesterSheet ? semesterRows : undefined,
        degreeProgramMapping: hasDegreeProgramSheet
          ? degreeProgramMapping
          : undefined,
        degreeProgramRows: hasDegreeProgramSheet ? degreeProgramRows : undefined,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setCommitResult(result);
      goTo("Done");
      toast.success("Import completed.");
    });
  }

  function handleMappingChange(fieldKey: string, header: string | null) {
    setMapping((prev) => {
      const next = { ...prev };
      if (!header || header === "__none__") {
        delete next[fieldKey];
      } else {
        next[fieldKey] = header;
      }
      return next;
    });
  }

  function handleSemesterMappingChange(fieldKey: string, header: string | null) {
    setSemesterMapping((prev) => {
      const next = { ...prev };
      if (!header || header === "__none__") {
        delete next[fieldKey];
      } else {
        next[fieldKey] = header;
      }
      return next;
    });
  }

  function handleDegreeProgramMappingChange(fieldKey: string, header: string | null) {
    setDegreeProgramMapping((prev) => {
      const next = { ...prev };
      if (!header || header === "__none__") {
        delete next[fieldKey];
      } else {
        next[fieldKey] = header;
      }
      return next;
    });
  }

  function selectFile(next: File | null) {
    if (!next) {
      setFile(null);
      return;
    }

    if (!isAcceptedImportFile(next, entity)) {
      setError(
        entity === "universities"
          ? "Supported formats: .csv, .xlsx, .xls, .zip"
          : "Supported formats: .csv, .xlsx, .xls",
      );
      return;
    }

    setError(undefined);
    setFile(next);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!pending) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (pending) return;

    const dropped = event.dataTransfer.files?.[0] ?? null;
    selectFile(dropped);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ol className="flex flex-wrap gap-2">
          {STEPS.map((label, index) => (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                index === stepIndex
                  ? "border-primary bg-primary/10 text-primary"
                  : index < stepIndex
                    ? "border-border text-muted-foreground"
                    : "border-border/60 text-muted-foreground/70",
              )}
            >
              <span className="tabular-nums">{index + 1}</span>
              {label}
            </li>
          ))}
        </ol>

        {entity && step === "Upload" ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => downloadBlob(generateCsvBlob(entity), `${entity}-template.csv`)}
            >
              <Download className="size-3.5" />
              CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => downloadBlob(generateExcelBlob(entity), `${entity}-template.xlsx`)}
            >
              <Download className="size-3.5" />
              Excel
            </Button>
            {entity === "universities" && (
              <UniversityZipInfo
                disabled={pending}
                onDownload={() => {
                  generateUniversitiesZipBlob().then((blob) => {
                    downloadBlob(blob, "universities-template.zip");
                  });
                }}
              />
            )}
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {step === "Type" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {ENTITIES.map((type) => (
            <button
              key={type}
              type="button"
              disabled={pending}
              onClick={() => resetAfterEntityChange(type)}
              className={cn(
                "cursor-pointer rounded-xl border p-5 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50",
                entity === type
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border",
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <FileSpreadsheet className="size-4 text-primary" />
                <span className="font-medium">{getImportEntityLabel(type)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {ENTITY_DESCRIPTIONS[type]}
              </p>
            </button>
          ))}
        </div>
      ) : null}

      {step === "Upload" && entity ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload spreadsheet</CardTitle>
            <CardDescription>
              Importing {getImportEntityLabel(entity).toLowerCase()} from CSV or
              Excel (.xlsx, .xls).
              {entity === "universities"
                ? " Multi-sheet Excel files and export ZIPs include semesters and degree programs automatically."
                : " First sheet is used."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={
                entity === "universities"
                  ? ".csv,.xlsx,.xls,.zip"
                  : ".csv,.xlsx,.xls"
              }
              className="sr-only"
              disabled={pending}
              onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
            />

            {file ? (
              <div
                className={cn(
                  "flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/[0.04] px-5 py-4 transition-opacity",
                  pending && "pointer-events-none opacity-50",
                )}
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-fuchsia-light text-primary">
                  <FileSpreadsheet className="size-5" />
                </div>
                <div className="min-w-0 flex-1 text-center">
                  <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" />
                  <button
                    type="button"
                    disabled={pending}
                    className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => selectFile(null)}
                    aria-label="Remove file"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={pending ? -1 : 0}
                onClick={() => {
                  if (!pending) fileInputRef.current?.click();
                }}
                onKeyDown={(event) => {
                  if (pending) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 outline-none transition-colors",
                  pending
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-muted/30",
                  isDragging ? "border-primary bg-primary/5" : "border-border",
                )}
              >
                <Upload className="size-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">Choose a file or drag it here</p>
                  <p className="text-sm text-muted-foreground">
                    Max 5 MB, up to 2,000 rows
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {step === "Map columns" && entity ? (
        <Card>
          <CardHeader>
            <CardTitle>Match columns</CardTitle>
            <CardDescription>
              Map each field to a column from your file. Required fields are
              marked.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            <details open={!hasSemesterSheet && !hasDegreeProgramSheet} className="group/section">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors">
                {entity === "universities" && (hasSemesterSheet || hasDegreeProgramSheet)
                  ? "Universities"
                  : "Column mapping"}
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-open/section:rotate-180" />
              </summary>
              <div className="space-y-5 px-4 pb-5 pt-3">
                <MappingProgressHeader fields={fields} mapping={mapping} />
                <MappingSpreadsheetTable
                  headers={headers}
                  fields={fields}
                  mapping={mapping}
                  onChange={handleMappingChange}
                  sampleRows={sampleRows}
                  disabled={pending}
                />
              </div>
            </details>

            {hasSemesterSheet ? (
              <details className="group/section">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors">
                  <span>
                    Semesters
                    <span className="ml-2 font-normal text-muted-foreground">
                      {semesterRows.length} row{semesterRows.length === 1 ? "" : "s"}
                    </span>
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground transition-transform group-open/section:rotate-180" />
                </summary>
                <div className="space-y-5 px-4 pb-5 pt-3">
                  <MappingProgressHeader fields={semesterFields} mapping={semesterMapping} />
                  <MappingSpreadsheetTable
                    headers={semesterHeaders}
                    fields={semesterFields}
                    mapping={semesterMapping}
                    onChange={handleSemesterMappingChange}
                    sampleRows={semesterSampleRows}
                    disabled={pending}
                  />
                </div>
              </details>
            ) : null}

            {hasDegreeProgramSheet ? (
              <details className="group/section">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors">
                  <span>
                    Degree programs
                    <span className="ml-2 font-normal text-muted-foreground">
                      {degreeProgramRows.length} row{degreeProgramRows.length === 1 ? "" : "s"}
                    </span>
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground transition-transform group-open/section:rotate-180" />
                </summary>
                <div className="space-y-5 px-4 pb-5 pt-3">
                  <MappingProgressHeader fields={degreeProgramFields} mapping={degreeProgramMapping} />
                  <MappingSpreadsheetTable
                    headers={degreeProgramHeaders}
                    fields={degreeProgramFields}
                    mapping={degreeProgramMapping}
                    onChange={handleDegreeProgramMappingChange}
                    sampleRows={degreeProgramSampleRows}
                    disabled={pending}
                  />
                </div>
              </details>
            ) : null}

            {entity === "students" ? (
              <div className="px-4 py-4">
                <div className="max-w-md space-y-1.5">
                  <Label htmlFor="import-password">
                    Temporary password (optional)
                  </Label>
                  <Input
                    id="import-password"
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={studentPassword}
                    disabled={pending}
                    onChange={(e) => setStudentPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for all new student accounts in this import.
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === "Preview" && preview ? (
        <Card>
          <CardHeader>
            <CardTitle>Review import</CardTitle>
            <CardDescription>
              {entity === "universities" &&
              (semesterPreview || degreeProgramPreview) ? (
                <>
                  Universities: {preview.validCount} valid, {preview.warningCount}{" "}
                  warning{preview.warningCount === 1 ? "" : "s"}, {preview.errorCount}{" "}
                  error{preview.errorCount === 1 ? "" : "s"}
                  {semesterPreview ? (
                    <>
                      {" "}
                      · Semesters: {semesterPreview.validCount} valid,{" "}
                      {semesterPreview.warningCount} warning
                      {semesterPreview.warningCount === 1 ? "" : "s"},{" "}
                      {semesterPreview.errorCount} error
                      {semesterPreview.errorCount === 1 ? "" : "s"}
                    </>
                  ) : null}
                  {degreeProgramPreview ? (
                    <>
                      {" "}
                      · Degree programs: {degreeProgramPreview.validCount} valid,{" "}
                      {degreeProgramPreview.warningCount} warning
                      {degreeProgramPreview.warningCount === 1 ? "" : "s"},{" "}
                      {degreeProgramPreview.errorCount} error
                      {degreeProgramPreview.errorCount === 1 ? "" : "s"}
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  {preview.validCount} valid, {preview.warningCount} warning
                  {preview.warningCount === 1 ? "" : "s"}, {preview.errorCount}{" "}
                  error{preview.errorCount === 1 ? "" : "s"}
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PreviewTable
              title={
                entity === "universities" &&
                (semesterPreview || degreeProgramPreview)
                  ? "Universities"
                  : "Rows"
              }
              rows={preview.rows}
            />
            {semesterPreview ? (
              <PreviewTable title="Semesters" rows={semesterPreview.rows} />
            ) : null}
            {degreeProgramPreview ? (
              <PreviewTable
                title="Degree programs"
                rows={degreeProgramPreview.rows}
              />
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === "Done" && commitResult ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" />
              Import complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">
                  {commitResult.semestersCreated != null ||
                  commitResult.degreeProgramsCreated != null
                    ? "Universities created"
                    : "Created"}
                </dt>
                <dd className="text-lg font-semibold">{commitResult.created}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  {commitResult.semestersCreated != null ||
                  commitResult.degreeProgramsCreated != null
                    ? "Universities updated"
                    : "Updated"}
                </dt>
                <dd className="text-lg font-semibold">{commitResult.updated}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Skipped</dt>
                <dd className="text-lg font-semibold">{commitResult.skipped}</dd>
              </div>
            </dl>

            {commitResult.semestersCreated != null ||
            commitResult.degreeProgramsCreated != null ? (
              <>
                {commitResult.semestersCreated != null ? (
                  <dl className="grid gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-muted-foreground">Semesters created</dt>
                      <dd className="text-lg font-semibold">
                        {commitResult.semestersCreated ?? 0}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Semesters updated</dt>
                      <dd className="text-lg font-semibold">
                        {commitResult.semestersUpdated ?? 0}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Semesters skipped</dt>
                      <dd className="text-lg font-semibold">
                        {commitResult.semestersSkipped ?? 0}
                      </dd>
                    </div>
                  </dl>
                ) : null}
                {commitResult.degreeProgramsCreated != null ? (
                  <dl className="grid gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-muted-foreground">Programs created</dt>
                      <dd className="text-lg font-semibold">
                        {commitResult.degreeProgramsCreated ?? 0}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Programs updated</dt>
                      <dd className="text-lg font-semibold">
                        {commitResult.degreeProgramsUpdated ?? 0}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Programs skipped</dt>
                      <dd className="text-lg font-semibold">
                        {commitResult.degreeProgramsSkipped ?? 0}
                      </dd>
                    </div>
                  </dl>
                ) : null}
              </>
            ) : null}

            {commitResult.generatedPassword ? (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="mb-2 text-sm font-medium">
                  Temporary password for new accounts
                </p>
                <CopyableValue
                  label="Password"
                  value={commitResult.generatedPassword}
                />
              </div>
            ) : null}

            {commitResult.errors.length > 0 ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="mb-2 text-sm font-medium">Issues</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {commitResult.errors.slice(0, 20).map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                  {commitResult.errors.length > 20 ? (
                    <li>…and {commitResult.errors.length - 20} more</li>
                  ) : null}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div
        className={cn(
          "flex flex-wrap items-center gap-3",
          step === "Type" || step === "Done" ? "justify-end" : "justify-between",
        )}
      >
        {step !== "Done" && step !== "Type" ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => {
              if (step === "Upload") goTo("Type");
              else if (step === "Map columns") goTo("Upload");
              else if (step === "Preview") goTo("Map columns");
            }}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        ) : null}

        <div className="flex gap-2">
          {step === "Type" ? (
            <Button
              type="button"
              disabled={!entity || pending}
              onClick={() => goTo("Upload")}
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : null}

          {step === "Upload" ? (
            <Button
              type="button"
              disabled={!file || pending}
              onClick={handleUpload}
            >
              {pending ? "Parsing…" : "Parse file"}
              <ArrowRight className="size-4" />
            </Button>
          ) : null}

          {step === "Map columns" ? (
            <Button
              type="button"
              disabled={pending}
              onClick={handlePreview}
            >
              {pending ? "Validating…" : "Preview import"}
              <ArrowRight className="size-4" />
            </Button>
          ) : null}

          {step === "Preview" ? (
            <Button
              type="button"
              disabled={
                pending ||
                !preview ||
                (preview.errorCount === preview.rows.length &&
                  (!semesterPreview ||
                    semesterPreview.errorCount === semesterPreview.rows.length) &&
                  (!degreeProgramPreview ||
                    degreeProgramPreview.errorCount ===
                      degreeProgramPreview.rows.length))
              }
              onClick={handleCommit}
            >
              {pending ? "Importing…" : "Confirm import"}
            </Button>
          ) : null}

          {step === "Done" ? (
            <Button
              type="button"
              onClick={() => {
                setStep("Type");
                setEntity(null);
                setFile(null);
                setHeaders([]);
                setRows([]);
                setSemesterHeaders([]);
                setSemesterRows([]);
                setSemesterMapping({});
                setDegreeProgramHeaders([]);
                setDegreeProgramRows([]);
                setDegreeProgramMapping({});
                setPreview(null);
                setCommitResult(null);
              }}
            >
              Import more data
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MappingProgressHeader({
  fields,
  mapping,
}: {
  fields: ImportFieldDef[];
  mapping: ColumnMapping;
}) {
  const requiredFields = fields.filter((field) => field.required);
  const mappedCount = requiredFields.filter((field) =>
    mapping[field.key]?.trim(),
  ).length;
  const total = requiredFields.length;
  const pct = total > 0 ? mappedCount / total : 1;

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const isComplete = total > 0 && mappedCount === total;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-muted/20 p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex shrink-0 items-center gap-3">
        <div className="relative flex size-14 items-center justify-center">
          <svg viewBox="0 0 56 56" className="size-14 -rotate-90">
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className={isComplete ? "text-success-light" : "text-brand-fuchsia-light"}
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={cn(
                "transition-all duration-300",
                isComplete ? "text-success" : "text-primary",
              )}
            />
          </svg>
          <span className="absolute text-xs font-semibold tabular-nums">
            {mappedCount}/{total}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold">Required fields mapped</p>
          <p className="text-xs text-muted-foreground">
            {isComplete
              ? "All required fields are mapped."
              : `${total - mappedCount} required field${total - mappedCount === 1 ? "" : "s"} still need${total - mappedCount === 1 ? "s" : ""} a column.`}
          </p>
        </div>
      </div>

      {requiredFields.length > 0 ? (
        <div className="flex flex-wrap gap-2 sm:border-l sm:border-border sm:pl-4">
          {requiredFields.map((field) => {
            const isMapped = Boolean(mapping[field.key]?.trim());
            return (
              <Badge
                key={field.key}
                variant={isMapped ? "default" : "outline"}
                className={cn(
                  "h-6 gap-1.5 rounded-full px-2.5 text-xs font-medium",
                  isMapped
                    ? "border-transparent bg-success-light text-success"
                    : "border-border bg-background text-muted-foreground",
                )}
              >
                {isMapped ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                )}
                {field.label}
              </Badge>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function MappingSpreadsheetTable({
  headers,
  fields,
  mapping,
  onChange,
  sampleRows,
  disabled,
}: {
  headers: string[];
  fields: ImportFieldDef[];
  mapping: ColumnMapping;
  onChange: (fieldKey: string, header: string | null) => void;
  sampleRows: Record<string, string>[];
  disabled?: boolean;
}) {
  if (fields.length === 0) {
    return null;
  }

  function handleSelect(fieldKey: string, header: string) {
    onChange(fieldKey, header === "__none__" ? null : header);
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border border-border/80 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/20">
              {fields.map((field, index) => {
                const header = mapping[field.key] ?? "__none__";
                const isMapped = header !== "__none__";
                return (
                  <th
                    key={field.key}
                    className="min-w-[190px] border-b border-border/60 px-4 py-3 text-left align-top"
                  >
                    <div className="space-y-2">
                      <span
                        className={cn(
                          "flex items-center gap-1 truncate text-sm font-semibold",
                          index === 0 ? "text-primary" : "text-foreground",
                        )}
                        title={field.label}
                      >
                        {field.label}
                        {field.required ? (
                          <span className="text-destructive">*</span>
                        ) : null}
                      </span>
                      <Select
                        value={header}
                        onValueChange={(v: string) => handleSelect(field.key, v)}
                        disabled={disabled}
                      >
                        <SelectTrigger disabled={disabled} className="h-8 w-full text-xs">
                          <SelectValue placeholder="Map column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Map column…</SelectItem>
                          {headers.map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isMapped ? (
                        <span className="inline-flex items-center gap-1 truncate text-[11px] font-medium text-success">
                          <CheckCircle2 className="size-3 shrink-0" />
                          {header}
                        </span>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sampleRows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/30"
              >
                {fields.map((field, colIndex) => {
                  const header = mapping[field.key];
                  const value = header ? row[header] : undefined;
                  return (
                    <td
                      key={field.key}
                      className={cn(
                        "max-w-[220px] truncate px-4 py-2.5 text-muted-foreground",
                        colIndex === 0 && "font-medium text-foreground",
                      )}
                      title={value || undefined}
                    >
                      {value || "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sampleRows.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Showing first {sampleRows.length} row{sampleRows.length === 1 ? "" : "s"} from
          your file.
        </p>
      ) : null}
    </div>
  );
}

function PreviewTable({
  title,
  rows,
}: {
  title: string;
  rows: ImportPreviewResult["rows"];
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="max-h-[320px] overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Line</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${title}-${row.line}`}>
                <TableCell>{row.line}</TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {row.message || "Ready to import"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "valid" | "warning" | "error";
}) {
  if (status === "valid") {
    return <Badge variant="secondary">Valid</Badge>;
  }
  if (status === "warning") {
    return (
      <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">
        Warning
      </Badge>
    );
  }
  return <Badge variant="destructive">Error</Badge>;
}
