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
