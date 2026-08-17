import { z } from "zod";

import { normalizeEthnicity } from "@/lib/ethnicity-options";
import { RELIGIONS } from "@/lib/religion";
import { SCHOLARSHIP_TYPES } from "@/lib/scholarship-type";

export const studentStatusEnum = z.enum(["ACTIVE", "GRADUATED", "INACTIVE"]);
export const scholarshipTypeFieldEnum = z.enum(SCHOLARSHIP_TYPES);
export const religionFieldEnum = z.enum(RELIGIONS);

const trimmedOptional = (schema: z.ZodType<string>) =>
  z.preprocess(
    (value) => {
      if (value === null || value === undefined) return undefined;
      const s = String(value).trim();
      return s.length > 0 ? s : undefined;
    },
    schema.optional(),
  );

const optionalName = z.preprocess(
  (value) => String(value ?? "").trim(),
  z.string(),
);

export const studentIdFieldSchema = trimmedOptional(
  z
    .string()
    .regex(
      /^[A-Za-z0-9-]{2,32}$/,
      "Student ID must be 2–32 letters, numbers, or hyphens.",
    ),
);

export const degreeProgramFieldSchema = trimmedOptional(
  z.string().min(2, "Degree program must be at least 2 characters."),
);

export const currentSemesterFieldSchema = trimmedOptional(
  z.string().min(2, "Current semester must be at least 2 characters."),
);

export const yearOfStudyFieldSchema = trimmedOptional(
  z.string().min(1, "Year of study is required.").max(40),
);

export const universityIdFieldSchema = trimmedOptional(z.string().min(1));

export const universityIdRequiredSchema = z
  .string()
  .trim()
  .min(1, "University is required.");

const optionalGpa = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return undefined;
    const s = String(value).trim();
    if (!s) return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  },
  z
    .number({ invalid_type_error: "GPA must be a number." })
    .min(0, "GPA must be at least 0.")
    .max(4, "GPA cannot exceed 4.")
    .optional(),
);

const optionalGraduationYear = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return undefined;
    const s = String(value).trim();
    if (!s) return undefined;
    const n = Number(s);
    return Number.isInteger(n) ? n : NaN;
  },
  z
    .number({ invalid_type_error: "Graduation year must be a number." })
    .int("Graduation year must be a whole year.")
    .min(1990, "Graduation year looks too early.")
    .max(2100, "Graduation year looks too far in the future.")
    .optional(),
);

const optionalEthnicity = z.preprocess((value) => {
  const list = normalizeEthnicity(value);
  return list.length > 0 ? list : undefined;
}, z.array(z.string().min(1).max(80)).max(40).optional());

const sharedProfileFields = {
  firstName: optionalName,
  lastName: optionalName,
  studentId: studentIdFieldSchema,
  phone: trimmedOptional(
    z
      .string()
      .regex(/^[\d\s+().-]{7,20}$/, "Enter a valid phone number."),
  ),
  ethnicity: optionalEthnicity,
  scholarshipType: trimmedOptional(scholarshipTypeFieldEnum),
  graduationYear: optionalGraduationYear,
  religion: trimmedOptional(religionFieldEnum),
  degreeProgram: degreeProgramFieldSchema,
  yearOfStudy: yearOfStudyFieldSchema,
  currentSemesterLabel: currentSemesterFieldSchema,
  gpa: optionalGpa,
  status: studentStatusEnum,
};

/** Student self-service profile — no status field; names and email required. */
export const studentProfileSelfEditSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    email: z.string().trim().email("Enter a valid email address."),
    studentId: studentIdFieldSchema,
    phone: trimmedOptional(
      z
        .string()
        .regex(/^[\d\s+().-]{7,20}$/, "Enter a valid phone number."),
    ),
    ethnicity: optionalEthnicity,
    scholarshipType: trimmedOptional(scholarshipTypeFieldEnum),
    graduationYear: optionalGraduationYear,
    religion: trimmedOptional(religionFieldEnum),
    universityId: universityIdFieldSchema,
    degreeProgram: degreeProgramFieldSchema,
    yearOfStudy: yearOfStudyFieldSchema,
    currentSemesterLabel: currentSemesterFieldSchema,
    gpa: optionalGpa,
  })
  .superRefine(semesterRequiresUniversity);

function semesterRequiresUniversity(
  data: { universityId?: string; currentSemesterLabel?: string },
  ctx: z.RefinementCtx,
) {
  if (data.currentSemesterLabel && !data.universityId) {
    ctx.addIssue({
      code: "custom",
      message: "Select a university before setting the current semester.",
      path: ["currentSemesterLabel"],
    });
  }
}

/** Minimal create — email validated separately; university required. */
export const studentProfileCreateSchema = z
  .object({
    ...sharedProfileFields,
    universityId: universityIdRequiredSchema,
  })
  .superRefine(semesterRequiresUniversity);

/** Full profile update — university optional; academic rules apply when set. */
export const studentProfileEditSchema = z
  .object({
    ...sharedProfileFields,
    universityId: universityIdFieldSchema,
  })
  .superRefine(semesterRequiresUniversity);

/** @deprecated Use create or edit schema explicitly. */
export const studentProfileFormSchema = studentProfileEditSchema;

export type StudentProfileCreateInput = z.input<
  typeof studentProfileCreateSchema
>;
export type StudentProfileEditInput = z.input<typeof studentProfileEditSchema>;
export type StudentProfileFormInput = StudentProfileEditInput;
export type StudentProfileFormData = z.infer<typeof studentProfileEditSchema>;
export type StudentProfileCreateData = z.infer<
  typeof studentProfileCreateSchema
>;
export type StudentProfileSelfEditData = z.infer<
  typeof studentProfileSelfEditSchema
>;

export function formatStudentProfileError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}

export function validateStudentProfileCreate(
  input: StudentProfileEditInput,
):
  | { success: true; data: StudentProfileCreateData }
  | { success: false; error: string } {
  const parsed = studentProfileCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatStudentProfileError(parsed.error) };
  }
  return { success: true, data: parsed.data };
}

export function validateStudentProfileEdit(
  input: StudentProfileEditInput,
):
  | { success: true; data: StudentProfileFormData }
  | { success: false; error: string } {
  const parsed = studentProfileEditSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatStudentProfileError(parsed.error) };
  }
  return { success: true, data: parsed.data };
}

export function validateStudentProfileSelfEdit(
  input: z.input<typeof studentProfileSelfEditSchema>,
):
  | { success: true; data: StudentProfileSelfEditData }
  | { success: false; error: string } {
  const parsed = studentProfileSelfEditSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatStudentProfileError(parsed.error) };
  }
  return { success: true, data: parsed.data };
}

/** @deprecated Use validateStudentProfileCreate or validateStudentProfileEdit. */
export function validateStudentProfileForm(
  input: StudentProfileFormInput,
): { success: true; data: StudentProfileFormData } | { success: false; error: string } {
  return validateStudentProfileEdit(input);
}

export function readStudentProfileFromFormData(
  formData: FormData,
): StudentProfileEditInput {
  return {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    studentId: formData.get("studentId"),
    phone: formData.get("phone"),
    ethnicity: formData.getAll("ethnicity"),
    scholarshipType: formData.get("scholarshipType"),
    graduationYear: formData.get("graduationYear"),
    religion: formData.get("religion"),
    universityId: formData.get("universityId"),
    degreeProgram: formData.get("degreeProgram"),
    yearOfStudy: formData.get("yearOfStudy"),
    currentSemesterLabel: formData.get("currentSemesterLabel"),
    gpa: formData.get("gpa"),
    status: (formData.get("status") ??
      "ACTIVE") as StudentProfileEditInput["status"],
  };
}

export function readStudentSelfProfileFromFormData(formData: FormData) {
  return {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    studentId: formData.get("studentId"),
    phone: formData.get("phone"),
    ethnicity: formData.getAll("ethnicity"),
    scholarshipType: formData.get("scholarshipType"),
    graduationYear: formData.get("graduationYear"),
    religion: formData.get("religion"),
    universityId: formData.get("universityId"),
    degreeProgram: formData.get("degreeProgram"),
    yearOfStudy: formData.get("yearOfStudy"),
    currentSemesterLabel: formData.get("currentSemesterLabel"),
    gpa: formData.get("gpa"),
  };
}
