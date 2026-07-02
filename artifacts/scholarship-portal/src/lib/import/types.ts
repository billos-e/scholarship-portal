export type ImportEntity = "students" | "universities" | "payments";

export type ImportFieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "enum";

export type ImportFieldDef = {
  key: string;
  label: string;
  required?: boolean;
  aliases?: string[];
  type?: ImportFieldType;
  enumValues?: string[];
};

/** Maps target field key → source spreadsheet column header. */
export type ColumnMapping = Record<string, string>;

export type ParsedSpreadsheet = {
  headers: string[];
  rows: Record<string, string>[];
  sampleRows: Record<string, string>[];
};

export type RowPreviewStatus = "valid" | "warning" | "error";

export type ImportRowPreview = {
  line: number;
  status: RowPreviewStatus;
  message?: string;
  data?: Record<string, unknown>;
};

export type ImportPreviewResult = {
  rows: ImportRowPreview[];
  validCount: number;
  warningCount: number;
  errorCount: number;
};

export type ImportCommitResult = {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  generatedPassword?: string;
  semestersCreated?: number;
  semestersUpdated?: number;
  semestersSkipped?: number;
  degreeProgramsCreated?: number;
  degreeProgramsUpdated?: number;
  degreeProgramsSkipped?: number;
};

export type ImportSecondarySheet = {
  headers: string[];
  rows: Record<string, string>[];
  sampleRows: Record<string, string>[];
  suggestedMapping: ColumnMapping;
  rowCount: number;
};

export type UniversitiesImportPreview = ImportPreviewResult & {
  semesters?: ImportPreviewResult;
  degreePrograms?: ImportPreviewResult;
};
