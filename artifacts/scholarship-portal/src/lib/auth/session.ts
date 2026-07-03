import { loadSession, clearSession, type SessionUser } from "./api";

/** Display name from session user. */
export function sessionDisplayName(user: SessionUser): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.email?.split("@")[0] ?? "User";
}

/** Returns the current session user from localStorage. */
export function getCurrentUser(): SessionUser | null {
  return loadSession();
}

/** Ensures a user is logged in (reads localStorage). Redirects to login if not. */
export function requireUser(): SessionUser {
  const user = loadSession();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/** Ensures an admin is logged in. */
export function requireAdmin(): SessionUser {
  const user = requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/** Ensures a student is logged in. */
export function requireStudentSession(): SessionUser {
  const user = requireUser();
  if (user.role !== "STUDENT") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/** Requires student + basic profile fields. */
export function requireStudent(): { user: SessionUser; student: { id: string } } {
  const user = requireStudentSession();
  if (!user.studentProfileId) {
    throw new Error("NO_STUDENT_PROFILE");
  }
  return { user, student: { id: user.studentProfileId } };
}

/** Sign-out helper: clears storage and reloads to login. */
export function logout() {
  clearSession();
  window.location.href = "/login";
}
