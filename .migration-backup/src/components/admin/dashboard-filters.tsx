"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import type { DashboardFilterState } from "@/lib/client-filters";

export type SemesterOption = {
  id: string;
  label: string;
  academicYear: string;
  universityId: string;
};

export type UniversityOption = {
  id: string;
  name: string;
};

type DashboardFiltersProps = {
  years: string[];
  universities: UniversityOption[];
  semesters: SemesterOption[];
  values: DashboardFilterState;
  onChange: (filters: DashboardFilterState) => void;
};

export function DashboardFilters({
  years,
  universities,
  semesters,
  values,
  onChange,
}: DashboardFiltersProps) {
  const filteredSemesters = useMemo(() => {
    return semesters.filter((semester) => {
      if (values.university && semester.universityId !== values.university) {
        return false;
      }
      if (values.year && semester.academicYear !== values.year) return false;
      return true;
    });
  }, [semesters, values.university, values.year]);

  function resetFilters() {
    onChange({ year: "", university: "", semester: "" });
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-end">
      <label className="grid gap-1 text-left">
        <span className="text-xs font-medium text-muted-foreground">Year</span>
        <NativeSelect
          value={values.year}
          onChange={(e) => {
            onChange({
              year: e.target.value,
              university: values.university,
              semester: "",
            });
          }}
          className="min-w-[7rem]"
        >
          <option value="">All years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </NativeSelect>
      </label>

      <label className="grid gap-1 text-left">
        <span className="text-xs font-medium text-muted-foreground">
          University
        </span>
        <NativeSelect
          value={values.university}
          onChange={(e) => {
            onChange({
              year: values.year,
              university: e.target.value,
              semester: "",
            });
          }}
          className="min-w-[11rem]"
        >
          <option value="">All universities</option>
          {universities.map((university) => (
            <option key={university.id} value={university.id}>
              {university.name}
            </option>
          ))}
        </NativeSelect>
      </label>

      <label className="grid gap-1 text-left">
        <span className="text-xs font-medium text-muted-foreground">
          Semester
        </span>
        <NativeSelect
          value={values.semester}
          onChange={(e) => {
            onChange({
              year: values.year,
              university: values.university,
              semester: e.target.value,
            });
          }}
          className="min-w-[10rem]"
        >
          <option value="">All semesters</option>
          {filteredSemesters.map((semester) => (
            <option key={semester.id} value={semester.id}>
              {semester.label}
            </option>
          ))}
        </NativeSelect>
      </label>

      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!values.year && !values.university && !values.semester}
        onClick={resetFilters}
      >
        Reset
      </Button>
    </div>
  );
}
