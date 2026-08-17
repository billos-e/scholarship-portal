import { randomUUID } from "crypto";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db, bankInformation, students } from "@workspace/db";

export const MAX_BANK_ACCOUNTS = 2;

export type BankAccountFields = {
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  promptpayNumber: string | null;
};

export type BankAccountSnapshot = BankAccountFields & {
  qrPaymentImageUrl?: string | null;
};

export type BankAccountRow = typeof bankInformation.$inferSelect;

function trimOrNull(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

export function isCompleteBankAccount(account: {
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
}): boolean {
  return Boolean(
    account.bankAccountName?.trim() &&
      account.bankAccountNumber?.trim() &&
      account.bankName?.trim(),
  );
}

export function hasAnyBankField(account: BankAccountFields): boolean {
  return Boolean(
    account.bankAccountName ||
      account.bankAccountNumber ||
      account.bankName ||
      account.promptpayNumber,
  );
}

export function primaryBankAccount<T extends { sortOrder?: number }>(
  accounts: T[],
): T | null {
  if (accounts.length === 0) return null;
  return (
    [...accounts].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))[0] ??
    null
  );
}

export const noCompleteBankSql = sql`NOT EXISTS (
  SELECT 1 FROM bank_information bi
  WHERE bi.student_id = ${students.id}
    AND COALESCE(btrim(bi.bank_account_name), '') <> ''
    AND COALESCE(btrim(bi.bank_account_number), '') <> ''
    AND COALESCE(btrim(bi.bank_name), '') <> ''
)`;

export async function fetchBankAccountsForStudents(
  studentIds: string[],
): Promise<Map<string, BankAccountRow[]>> {
  const map = new Map<string, BankAccountRow[]>();
  if (studentIds.length === 0) return map;

  const rows = await db
    .select()
    .from(bankInformation)
    .where(inArray(bankInformation.studentId, studentIds))
    .orderBy(asc(bankInformation.sortOrder));

  for (const row of rows) {
    const list = map.get(row.studentId) ?? [];
    list.push(row);
    map.set(row.studentId, list);
  }
  return map;
}

export async function fetchStudentBankAccounts(
  studentId: string,
): Promise<BankAccountRow[]> {
  const map = await fetchBankAccountsForStudents([studentId]);
  return map.get(studentId) ?? [];
}

export function attachBankFields<T extends Record<string, unknown>>(
  student: T,
  accounts: BankAccountRow[],
) {
  const sorted = [...accounts].sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    ...student,
    bankAccounts: sorted,
    bankInformation: primaryBankAccount(sorted),
  };
}

function parseOneAccount(value: unknown): BankAccountFields | { error: string } {
  if (!value || typeof value !== "object") {
    return { error: "Invalid bank account." };
  }
  const item = value as Record<string, unknown>;
  return {
    bankAccountName: trimOrNull(item.bankAccountName),
    bankAccountNumber: trimOrNull(item.bankAccountNumber),
    bankName: trimOrNull(item.bankName),
    promptpayNumber: trimOrNull(item.promptpayNumber),
  };
}

export function parseBankAccountsBody(
  body: Record<string, unknown>,
):
  | { provided: false }
  | { provided: true; accounts: BankAccountFields[] }
  | { provided: true; error: string } {
  if (!("bankAccounts" in body)) return { provided: false };
  if (!Array.isArray(body.bankAccounts)) {
    return { provided: true, error: "bankAccounts must be a list." };
  }
  if (body.bankAccounts.length > MAX_BANK_ACCOUNTS) {
    return {
      provided: true,
      error: "A student can have at most 2 bank accounts.",
    };
  }

  const accounts: BankAccountFields[] = [];
  for (const item of body.bankAccounts) {
    const parsed = parseOneAccount(item);
    if ("error" in parsed) return { provided: true, error: parsed.error };
    if (accounts.length === 0 || hasAnyBankField(parsed)) {
      accounts.push(parsed);
    }
  }

  if (accounts.length > MAX_BANK_ACCOUNTS) {
    return {
      provided: true,
      error: "A student can have at most 2 bank accounts.",
    };
  }

  return { provided: true, accounts };
}

export function parseLegacyBankFields(
  body: Record<string, unknown>,
): BankAccountFields | null {
  const keys = [
    "bankAccountName",
    "bankAccountNumber",
    "bankName",
    "promptpayNumber",
  ] as const;
  if (!keys.some((key) => key in body)) return null;
  return {
    bankAccountName: trimOrNull(body.bankAccountName),
    bankAccountNumber: trimOrNull(body.bankAccountNumber),
    bankName: trimOrNull(body.bankName),
    promptpayNumber: trimOrNull(body.promptpayNumber),
  };
}

export async function replaceStudentBankAccounts(
  studentId: string,
  accounts: BankAccountFields[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (accounts.length > MAX_BANK_ACCOUNTS) {
    return { ok: false, error: "A student can have at most 2 bank accounts." };
  }

  const existing = await fetchStudentBankAccounts(studentId);
  const now = new Date();
  const keepIds: string[] = [];

  for (let i = 0; i < accounts.length; i++) {
    const sortOrder = i + 1;
    const fields = accounts[i];
    const reuse = existing[i];
    if (reuse) {
      await db
        .update(bankInformation)
        .set({
          sortOrder,
          bankAccountName: fields.bankAccountName,
          bankAccountNumber: fields.bankAccountNumber,
          bankName: fields.bankName,
          promptpayNumber: fields.promptpayNumber,
          lastUpdatedAt: now,
        })
        .where(eq(bankInformation.id, reuse.id));
      keepIds.push(reuse.id);
    } else {
      await db.insert(bankInformation).values({
        id: randomUUID(),
        studentId,
        sortOrder,
        ...fields,
        lastUpdatedAt: now,
      });
    }
  }

  for (const row of existing) {
    if (!keepIds.includes(row.id)) {
      await db.delete(bankInformation).where(eq(bankInformation.id, row.id));
    }
  }

  return { ok: true };
}

export async function upsertPrimaryBankAccount(
  studentId: string,
  fields: BankAccountFields,
): Promise<void> {
  const existing = await fetchStudentBankAccounts(studentId);
  const primary =
    existing.find((row) => row.sortOrder === 1) ?? existing[0] ?? null;
  const now = new Date();

  if (primary) {
    await db
      .update(bankInformation)
      .set({ ...fields, lastUpdatedAt: now })
      .where(eq(bankInformation.id, primary.id));
    return;
  }

  await db.insert(bankInformation).values({
    id: randomUUID(),
    studentId,
    sortOrder: 1,
    ...fields,
    lastUpdatedAt: now,
  });
}

export async function resolveSubmissionBankSnapshot(
  studentId: string,
  body: Record<string, unknown>,
): Promise<
  | {
      ok: true;
      snapshot: BankAccountSnapshot;
      accountId: string | null;
    }
  | { ok: false; error: string }
> {
  const accounts = await fetchStudentBankAccounts(studentId);
  const requestedId =
    typeof body.bankAccountId === "string" ? body.bankAccountId.trim() : "";

  let selected: BankAccountRow | null = null;
  if (requestedId) {
    selected = accounts.find((row) => row.id === requestedId) ?? null;
    if (!selected) {
      return { ok: false, error: "Please choose a valid bank account." };
    }
  } else {
    selected = primaryBankAccount(accounts);
  }

  const snapshot: BankAccountSnapshot = selected
    ? {
        bankAccountName: selected.bankAccountName,
        bankAccountNumber: selected.bankAccountNumber,
        bankName: selected.bankName,
        promptpayNumber: selected.promptpayNumber,
        qrPaymentImageUrl: selected.qrPaymentImageUrl,
      }
    : {
        bankAccountName: trimOrNull(body.bankAccountName),
        bankAccountNumber: trimOrNull(body.bankAccountNumber),
        bankName: trimOrNull(body.bankName),
        promptpayNumber: trimOrNull(body.promptpayNumber),
      };

  if (typeof body.qrPaymentImageUrl === "string" && body.qrPaymentImageUrl.trim()) {
    snapshot.qrPaymentImageUrl = body.qrPaymentImageUrl.trim();
  }

  return {
    ok: true,
    snapshot,
    accountId: selected?.id ?? null,
  };
}

export async function persistSubmissionBankRow(
  studentId: string,
  accountId: string | null,
  snapshot: BankAccountSnapshot,
): Promise<void> {
  const now = new Date();
  const patch = {
    bankAccountName: snapshot.bankAccountName,
    bankAccountNumber: snapshot.bankAccountNumber,
    bankName: snapshot.bankName,
    promptpayNumber: snapshot.promptpayNumber,
    ...(snapshot.qrPaymentImageUrl
      ? { qrPaymentImageUrl: snapshot.qrPaymentImageUrl }
      : {}),
    lastUpdatedAt: now,
  };

  if (accountId) {
    await db
      .update(bankInformation)
      .set(patch)
      .where(
        and(eq(bankInformation.id, accountId), eq(bankInformation.studentId, studentId)),
      );
    return;
  }

  const existing = await fetchStudentBankAccounts(studentId);
  if (existing.length >= MAX_BANK_ACCOUNTS) return;

  const primary = primaryBankAccount(existing);
  if (primary) {
    await db
      .update(bankInformation)
      .set(patch)
      .where(eq(bankInformation.id, primary.id));
    return;
  }

  await db.insert(bankInformation).values({
    id: randomUUID(),
    studentId,
    sortOrder: 1,
    ...patch,
  });
}
