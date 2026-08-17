import { Resend } from "resend";
import { logger } from "./logger";

/** Resend test sender. Production should set RESEND_FROM_EMAIL to a verified domain. */
export const DEFAULT_FROM_EMAIL = "Scholarship Portal <beth.t@example.com>";

export function getFromAddress(): string {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  return from || DEFAULT_FROM_EMAIL;
}

export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export type SendEmailInput = {
  to: string[];
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
};

export type SendEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; reason: string };

/**
 * Send one email via Resend. Missing API key logs a warning and skips
 * (never throws). Resend `{ error }` is treated as a failed send.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    logger.warn(
      "RESEND_API_KEY is not set; skipping email send. Admin notifications will not go out until the key is configured.",
    );
    return { ok: false, skipped: true, reason: "RESEND_API_KEY is not set" };
  }

  const recipients = [...new Set(input.to.map((e) => e.trim()).filter(Boolean))];
  if (recipients.length === 0) {
    logger.warn("No email recipients; skipping send.");
    return { ok: false, skipped: true, reason: "no recipients" };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send(
      {
        from: getFromAddress(),
        to: recipients,
        subject: input.subject,
        html: input.html,
        text: input.text,
      },
      input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
    );

    if (error) {
      logger.error({ error }, "Resend rejected the email send");
      return {
        ok: false,
        skipped: false,
        reason: error.message || "Resend error",
      };
    }

    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    logger.error({ err }, "Resend send threw");
    return {
      ok: false,
      skipped: false,
      reason: err instanceof Error ? err.message : "send failed",
    };
  }
}
