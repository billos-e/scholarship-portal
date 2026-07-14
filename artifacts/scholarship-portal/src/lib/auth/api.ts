const base = import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, "") : "";

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Sign-in failed." }));
    throw new Error(body.error ?? "Sign-in failed.");
  }
  return (await res.json()) as SessionUser;
}

export type SessionUser = {
  id: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  studentProfileId?: string;
  firstName?: string;
  lastName?: string;
};

const STORAGE_KEY = "scholarship_session";

export function saveSession(user: SessionUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function loadSession(): SessionUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Exchange the active Clerk session for an admin portal session.
 * Accepts an optional Bearer token so this works in dev (where the Clerk proxy
 * is disabled and the __session cookie never reaches Express) as well as in
 * production (where cookies flow through the same-origin proxy).
 */
export async function apiClerkAdminSession(token?: string | null): Promise<SessionUser> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${base}/api/auth/clerk-admin-session`, {
    method: "POST",
    credentials: "include",
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Sign-in failed." }));
    throw new Error(body.error ?? "Sign-in failed.");
  }
  return (await res.json()) as SessionUser;
}

/**
 * Creates a new admin account. Caller must already be signed in as an admin
 * via Clerk (session cookie is sent with the request).
 */
export async function apiCreateAdmin(
  email: string,
): Promise<{ email: string; generatedPassword: string }> {
  const res = await fetch(`${base}/api/auth/create-admin`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const body = await res.json().catch(() => ({ error: "Request failed." }));
  if (!res.ok) {
    throw new Error(body.error ?? "Could not create admin account.");
  }
  return body as { email: string; generatedPassword: string };
}

export type AdminListItem = {
  id: string;
  email: string;
  imageUrl: string | null;
  lastLoginAt: string | null;
};

/**
 * Lists all admin accounts. Caller must already be signed in as an admin
 * via Clerk (session cookie is sent with the request).
 */
export async function apiListAdmins(): Promise<AdminListItem[]> {
  const res = await fetch(`${base}/api/auth/admins`, {
    method: "GET",
    credentials: "include",
  });
  const body = await res.json().catch(() => ({ error: "Request failed." }));
  if (!res.ok) {
    throw new Error(body.error ?? "Could not load admin accounts.");
  }
  return (body as { admins: AdminListItem[] }).admins;
}
