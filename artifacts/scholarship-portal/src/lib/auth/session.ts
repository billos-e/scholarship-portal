import {
  CURRENT_ADMIN_USER,
  CURRENT_STUDENT_USER,
  getCurrentStudentProfile,
} from "@/lib/stub/sample-data";

type SessionUser = {
  id: string;
  email?: string | null;
  role: "ADMIN" | "STUDENT";
  studentProfileId?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

/** Returns the current session user (placeholder — always signed in as admin). */
export function getCurrentUser(): SessionUser {
  return CURRENT_ADMIN_USER;
}

/** Display name from session (no DB). Falls back to email local-part. */
export function sessionDisplayName(user: SessionUser): string {
  if (user.displayName) return user.displayName;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.email?.split("@")[0] ?? "User";
}

/** Placeholder: ensures a user is "logged in". */
export function requireUser(): SessionUser {
  return CURRENT_ADMIN_USER;
}

/** Placeholder student session. */
export function requireStudentSession(): SessionUser {
  return CURRENT_STUDENT_USER;
}

/** Placeholder admin session. */
export function requireAdmin(): SessionUser {
  return CURRENT_ADMIN_USER;
}

/** Placeholder student session + profile. */
export function requireStudent(): { user: SessionUser; student: ReturnType<typeof getCurrentStudentProfile> } {
  return { user: CURRENT_STUDENT_USER, student: getCurrentStudentProfile() };
}
