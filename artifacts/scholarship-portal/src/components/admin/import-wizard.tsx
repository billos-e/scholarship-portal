"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
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
  ImportPreviewResult,
  UniversitiesImportPreview,
} from "@/lib/import/types";
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
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {entity === "universities" && (hasSemesterSheet || hasDegreeProgramSheet) ? (
                <h3 className="text-sm font-medium">Universities</h3>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label>
                      {field.label}
                      {field.required ? (
                        <span className="text-destructive"> *</span>
                      ) : null}
                    </Label>
                    <Select
                      value={mapping[field.key] ?? "__none__"}
                      onValueChange={(value) =>
                        handleMappingChange(field.key, value)
                      }
                      disabled={pending}
                    >
                      <SelectTrigger disabled={pending}>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Not mapped —</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <SpreadsheetSampleTable
                title={
                  entity === "universities" && (hasSemesterSheet || hasDegreeProgramSheet)
                    ? "University data preview"
                    : "Data preview"
                }
                headers={headers}
                rows={sampleRows}
              />
            </div>

            {hasSemesterSheet ? (
              <div className="space-y-4 border-t pt-6">
                <div>
                  <h3 className="text-sm font-medium">Semesters</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {semesterRows.length} row{semesterRows.length === 1 ? "" : "s"}{" "}
                    detected. Match each field to the column headers shown in the
                    preview below.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {semesterFields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <Label>
                        {field.label}
                        {field.required ? (
                          <span className="text-destructive"> *</span>
                        ) : null}
                      </Label>
                      <Select
                        value={semesterMapping[field.key] ?? "__none__"}
                        onValueChange={(value) =>
                          handleSemesterMappingChange(field.key, value)
                        }
                        disabled={pending}
                      >
                        <SelectTrigger disabled={pending}>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Not mapped —</SelectItem>
                          {semesterHeaders.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <SpreadsheetSampleTable
                  title="Semester data preview"
                  headers={semesterHeaders}
                  rows={semesterSampleRows}
                />
              </div>
            ) : null}

            {hasDegreeProgramSheet ? (
              <div className="space-y-4 border-t pt-6">
                <div>
                  <h3 className="text-sm font-medium">Degree programs</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {degreeProgramRows.length} row
                    {degreeProgramRows.length === 1 ? "" : "s"} detected. Match each
                    field to the column headers shown in the preview below.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {degreeProgramFields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <Label>
                        {field.label}
                        {field.required ? (
                          <span className="text-destructive"> *</span>
                        ) : null}
                      </Label>
                      <Select
                        value={degreeProgramMapping[field.key] ?? "__none__"}
                        onValueChange={(value) =>
                          handleDegreeProgramMappingChange(field.key, value)
                        }
                        disabled={pending}
                      >
                        <SelectTrigger disabled={pending}>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Not mapped —</SelectItem>
                          {degreeProgramHeaders.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <SpreadsheetSampleTable
                  title="Degree program data preview"
                  headers={degreeProgramHeaders}
                  rows={degreeProgramSampleRows}
                />
              </div>
            ) : null}

            {entity === "students" ? (
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

function SpreadsheetSampleTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: Record<string, string>[];
}) {
  if (headers.length === 0 || rows.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header} className="whitespace-nowrap">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell
                    key={header}
                    className="max-w-[220px] truncate whitespace-nowrap"
                    title={row[header] || undefined}
                  >
                    {row[header] || "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing first {rows.length} row{rows.length === 1 ? "" : "s"} from your
        file.
      </p>
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
