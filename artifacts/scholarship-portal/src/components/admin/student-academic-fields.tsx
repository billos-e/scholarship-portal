"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import type {
  SemesterOption,
  StudentAcademicOptions,
} from "@/lib/student-academic-options";

type UniversityOption = { id: string; name: string };

type StudentAcademicFieldsProps = {
  universities: UniversityOption[];
  academicOptions: StudentAcademicOptions;
  defaultUniversityId?: string | null;
  defaultDegreeProgram?: string | null;
  defaultSemesterLabel?: string | null;
  defaultYearOfStudy?: string | null;
  universityRequired?: boolean;
  showUniversity?: boolean;
  showProgram?: boolean;
  showSemester?: boolean;
  idPrefix?: string;
  /** When set, university is controlled by the parent (e.g. split create form layout). */
  universityId?: string;
  onUniversityChange?: (id: string) => void;
  universityClassName?: string;
  programClassName?: string;
  yearClassName?: string;
  semesterClassName?: string;
};

function mergeProgramOptions(
  programs: string[],
  current?: string | null,
): string[] {
  if (!current?.trim()) return programs;
  const set = new Set(programs);
  set.add(current.trim());
  return [...set].sort((a, b) => a.localeCompare(b));
}

function mergeSemesterOptions(
  semesters: SemesterOption[],
  currentLabel?: string | null,
): SemesterOption[] {
  if (!currentLabel?.trim()) return semesters;
  if (semesters.some((s) => s.label === currentLabel)) return semesters;
  return [
    ...semesters,
    {
      id: `legacy-${currentLabel}`,
      label: currentLabel,
      academicYear: "",
      startDate: "",
      endDate: "",
    },
  ];
}

export function StudentAcademicFields({
  universities,
  academicOptions,
  defaultUniversityId = "",
  defaultDegreeProgram = "",
  defaultSemesterLabel = "",
  defaultYearOfStudy = "",
  universityRequired = false,
  showUniversity = true,
  showProgram = true,
  showSemester = true,
  idPrefix = "",
  universityId: controlledUniversityId,
  onUniversityChange,
  universityClassName = "min-w-0 space-y-2",
  programClassName = "min-w-0 space-y-2",
  yearClassName = "min-w-0 space-y-2",
  semesterClassName = "min-w-0 space-y-2",
}: StudentAcademicFieldsProps) {
  const prefix = idPrefix ? `${idPrefix}-` : "";
  const [internalUniversityId, setInternalUniversityId] = useState(
    defaultUniversityId ?? "",
  );
  const [degreeProgram, setDegreeProgram] = useState(
    defaultDegreeProgram ?? "",
  );
  const [semesterLabel, setSemesterLabel] = useState(
    defaultSemesterLabel ?? "",
  );
  const [yearOfStudy, setYearOfStudy] = useState(defaultYearOfStudy ?? "");

  const universityId = controlledUniversityId ?? internalUniversityId;

  useEffect(() => {
    if (controlledUniversityId === undefined) {
      setInternalUniversityId(defaultUniversityId ?? "");
    }
    setDegreeProgram(defaultDegreeProgram ?? "");
    setSemesterLabel(defaultSemesterLabel ?? "");
    setYearOfStudy(defaultYearOfStudy ?? "");
  }, [
    controlledUniversityId,
    defaultUniversityId,
    defaultDegreeProgram,
    defaultSemesterLabel,
    defaultYearOfStudy,
  ]);

  const prevUniversityId = useRef(universityId);
  useEffect(() => {
    if (prevUniversityId.current !== universityId) {
      prevUniversityId.current = universityId;
      if (controlledUniversityId !== undefined) {
        setDegreeProgram("");
        setSemesterLabel("");
      }
    }
  }, [universityId, controlledUniversityId]);

  // Only keep the originally-assigned program/semester selectable while
  // that same university is still selected. Switching to a different
  // university must not carry over a value that doesn't belong to that
  // university's own catalog.
  const isOriginalUniversity = universityId === (defaultUniversityId ?? "");

  const programs = useMemo(
    () =>
      universityId
        ? mergeProgramOptions(
            academicOptions.programsByUniversity[universityId] ?? [],
            isOriginalUniversity ? defaultDegreeProgram : null,
          )
        : [],
    [
      universityId,
      academicOptions.programsByUniversity,
      defaultDegreeProgram,
      isOriginalUniversity,
    ],
  );

  const semesters = useMemo(
    () =>
      universityId
        ? mergeSemesterOptions(
            academicOptions.semestersByUniversity[universityId] ?? [],
            isOriginalUniversity ? defaultSemesterLabel : null,
          )
        : [],
    [
      universityId,
      academicOptions.semestersByUniversity,
      defaultSemesterLabel,
      isOriginalUniversity,
    ],
  );

  function handleUniversityChange(nextId: string) {
    if (onUniversityChange) {
      onUniversityChange(nextId);
    } else {
      setInternalUniversityId(nextId);
    }
    setDegreeProgram("");
    setSemesterLabel("");
  }

  return (
    <>
      {showUniversity ? (
        <div className={universityClassName}>
          <Label htmlFor={`${prefix}universityId`}>
            University
            {universityRequired ? (
              <span className="text-destructive"> *</span>
            ) : null}
          </Label>
          <input type="hidden" name="universityId" value={universityId} />
          <NativeSelect
            id={`${prefix}universityId`}
            value={universityId}
            onChange={(e) => handleUniversityChange(e.target.value)}
            required={universityRequired}
          >
            <option value="">
              {universityRequired ? "Select university…" : "— None —"}
            </option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </NativeSelect>
        </div>
      ) : null}

      {showProgram ? (
        <div className={programClassName}>
          <Label htmlFor={`${prefix}degreeProgram`}>Degree program</Label>
          <input type="hidden" name="degreeProgram" value={degreeProgram} />
          <NativeSelect
            id={`${prefix}degreeProgram`}
            value={degreeProgram}
            onChange={(e) => setDegreeProgram(e.target.value)}
            disabled={!universityId || programs.length === 0}
          >
            <option value="">
              {!universityId
                ? "Select a university first"
                : programs.length === 0
                  ? "No programs configured"
                  : "Select a program…"}
            </option>
            {programs.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </NativeSelect>
          {universityId && programs.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No programs configured yet for this university. Ask an admin to
              add one on the university profile before assigning it here.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={yearClassName}>
        <Label htmlFor={`${prefix}yearOfStudy`}>Year of study</Label>
        <input type="hidden" name="yearOfStudy" value={yearOfStudy} />
        <Input
          id={`${prefix}yearOfStudy`}
          value={yearOfStudy}
          onChange={(e) => setYearOfStudy(e.target.value)}
          placeholder="e.g. 2"
        />
      </div>

      {showSemester ? (
        <div className={semesterClassName}>
          <Label htmlFor={`${prefix}currentSemesterLabel`}>
            Current semester
          </Label>
          <input type="hidden" name="currentSemesterLabel" value={semesterLabel} />
          <NativeSelect
            id={`${prefix}currentSemesterLabel`}
            value={semesterLabel}
            onChange={(e) => setSemesterLabel(e.target.value)}
            disabled={!universityId || semesters.length === 0}
          >
            <option value="">
              {!universityId
                ? "Select a university first"
                : semesters.length === 0
                  ? "No semesters configured"
                  : "Select semester…"}
            </option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.label}>
                {semester.label}
                {semester.academicYear ? ` (${semester.academicYear})` : ""}
              </option>
            ))}
          </NativeSelect>
          {universityId && semesters.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Add semesters on the university profile before assigning one here.
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
