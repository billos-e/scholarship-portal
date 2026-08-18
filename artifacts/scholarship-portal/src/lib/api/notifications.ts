import { apiBase } from "./shared";
import { requireAdmin } from "@/lib/auth/session";

export type AdminNotificationKind =
  | "GPA_UNDER_3"
  | "EMERGENCY_AID"
  | "DEADLINE_APPROACHING"
  | "DEADLINE_OVERDUE";

export type AdminNotification = {
  id: string;
  kind: AdminNotificationKind;
  title: string;
  studentName: string;
  studentCode: string | null;
  semesterLabel: string;
  requestId: string;
  createdAt: string;
};

function adminHeaders(): HeadersInit {
  const admin = requireAdmin();
  return { "X-Admin-Id": admin.id };
}

export async function fetchUnreadAdminNotifications(): Promise<AdminNotification[]> {
  const res = await fetch(`${apiBase}/api/admin/notifications`, {
    method: "GET",
    credentials: "include",
    headers: adminHeaders(),
  });
  const body = await res.json().catch(() => ({ error: "Request failed." }));
  if (!res.ok) {
    throw new Error(body.error ?? "Could not load notifications.");
  }
  return (body as { notifications: AdminNotification[] }).notifications;
}

export async function dismissAdminNotification(id: string): Promise<void> {
  const res = await fetch(`${apiBase}/api/admin/notifications/${encodeURIComponent(id)}/dismiss`, {
    method: "POST",
    credentials: "include",
    headers: adminHeaders(),
  });
  if (res.status === 404) {
    throw new Error("Notification not found.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed." }));
    throw new Error(body.error ?? "Could not dismiss notification.");
  }
}
