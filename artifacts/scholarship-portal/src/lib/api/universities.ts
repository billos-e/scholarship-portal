const apiBase = import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL.replace(/\/$/, "")
  : "";

export type UniversityListItem = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  addressLine: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  notes: string | null;
  hasSummerSemester: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { students: number };
  semesters: {
    id: string;
    academicYear: string;
    termCode: string;
    label: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }[];
  degreePrograms: {
    id: string;
    name: string;
    isActive: boolean;
  }[];
};

export type UniversityDetail = UniversityListItem & {
  students: {
    id: string;
    firstName: string;
    lastName: string;
    studentId: string | null;
    status: string;
  }[];
  semesters: (UniversityListItem["semesters"][number] & {
    _count: { tuitionPaymentRequests: number };
  })[];
  assignedDegreePrograms: string[];
};

export async function fetchUniversities(): Promise<UniversityListItem[]> {
  const res = await fetch(`${apiBase}/api/universities`);
  if (!res.ok) throw new Error("Failed to fetch universities");
  return res.json();
}

export async function fetchUniversity(id: string): Promise<UniversityDetail | null> {
  const res = await fetch(`${apiBase}/api/universities/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch university");
  return res.json();
}

export type ActiveUniversity = { id: string; name: string };

export async function fetchActiveUniversities(): Promise<ActiveUniversity[]> {
  const res = await fetch(`${apiBase}/api/universities/active`);
  if (!res.ok) throw new Error("Failed to fetch universities");
  return res.json();
}
