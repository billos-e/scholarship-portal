"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";

const apiBase = import.meta.env.BASE_URL
  ? import.meta.env.BASE_URL.replace(/\/$/, "")
  : "";

export type RequestActionState = {
  error?: string;
  success?: boolean;
};

async function apiFetch(
  path: string,
  method: string,
  body: unknown,
): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${apiBase}/api${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: (data as any).error ?? "Request failed." };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

function pathsToRevalidate(requestId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/requests");
  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath("/student");
  revalidatePath("/student/history");
}

const transitionSchema = z.object({
  requestId: z.string().min(1, "Missing request id."),
  nextStatus: z.enum(["SUBMITTED", "UNDER_REVIEW", "APPROVED", "PAID", "REJECTED"]),
  paymentDate: z.string().trim().optional(),
});

export async function transitionRequestStatus(
  _prev: RequestActionState,
  formData: FormData,
): Promise<RequestActionState> {
  await requireAdmin();

  const parsed = transitionSchema.safeParse({
    requestId: formData.get("requestId"),
    nextStatus: formData.get("nextStatus"),
    paymentDate: formData.get("paymentDate") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await apiFetch(`/requests/${parsed.data.requestId}/status`, "PUT", {
    nextStatus: parsed.data.nextStatus,
    paymentDate: parsed.data.paymentDate,
  });
  if (!result.ok) return { error: result.error };

  pathsToRevalidate(parsed.data.requestId);
  return { success: true };
}

const notesSchema = z.object({
  requestId: z.string().min(1, "Missing request id."),
  adminNotes: z.string().trim().max(4000).optional(),
});

export async function updateRequestAdminNotes(
  _prev: RequestActionState,
  formData: FormData,
): Promise<RequestActionState> {
  await requireAdmin();

  const parsed = notesSchema.safeParse({
    requestId: formData.get("requestId"),
    adminNotes: ((formData.get("adminNotes") as string) ?? "").trim() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await apiFetch(`/requests/${parsed.data.requestId}/notes`, "PATCH", {
    adminNotes: parsed.data.adminNotes ?? null,
  });
  if (!result.ok) return { error: result.error };

  pathsToRevalidate(parsed.data.requestId);
  return { success: true };
}

const paymentNotesSchema = z.object({
  requestId: z.string().min(1, "Missing request id."),
  internalNotes: z.string().trim().max(4000).optional(),
});

export async function updatePaymentInternalNotes(
  _prev: RequestActionState,
  formData: FormData,
): Promise<RequestActionState> {
  await requireAdmin();

  const parsed = paymentNotesSchema.safeParse({
    requestId: formData.get("requestId"),
    internalNotes: ((formData.get("internalNotes") as string) ?? "").trim() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await apiFetch(`/requests/${parsed.data.requestId}/payment-notes`, "PATCH", {
    internalNotes: parsed.data.internalNotes ?? null,
  });
  if (!result.ok) return { error: result.error };

  pathsToRevalidate(parsed.data.requestId);
  return { success: true };
}
