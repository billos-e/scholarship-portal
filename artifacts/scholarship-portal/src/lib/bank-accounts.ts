export const MAX_BANK_ACCOUNTS = 2;

export type BankAccountFields = {
  id?: string;
  sortOrder?: number;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  promptpayNumber: string | null;
};

export function isCompleteBankAccount(account: {
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
} | null | undefined): boolean {
  return Boolean(
    account?.bankAccountName?.trim() &&
      account?.bankAccountNumber?.trim() &&
      account?.bankName?.trim(),
  );
}

export function hasAnyBankField(account: {
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  promptpayNumber?: string | null;
} | null | undefined): boolean {
  return Boolean(
    account?.bankAccountName?.trim() ||
      account?.bankAccountNumber?.trim() ||
      account?.bankName?.trim() ||
      account?.promptpayNumber?.trim(),
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

export function formatBankAccountOption(account: {
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
}): string {
  const bank = account.bankName?.trim() || "Bank account";
  const holder = account.bankAccountName?.trim();
  const number = account.bankAccountNumber?.trim();
  if (holder && number) return `${bank} · ${holder} · ${number}`;
  if (number) return `${bank} · ${number}`;
  if (holder) return `${bank} · ${holder}`;
  return bank;
}

function optionalString(value: FormDataEntryValue | null): string | undefined {
  const s = (value as string | null)?.trim();
  return s && s.length > 0 ? s : undefined;
}

export function readBankAccountsFromFormData(formData: FormData): BankAccountFields[] {
  const account1: BankAccountFields = {
    id: optionalString(formData.get("bankAccountId")),
    bankAccountName: optionalString(formData.get("bankAccountName")) ?? null,
    bankAccountNumber: optionalString(formData.get("bankAccountNumber")) ?? null,
    bankName: optionalString(formData.get("bankName")) ?? null,
    promptpayNumber: optionalString(formData.get("promptpayNumber")) ?? null,
  };

  const includeSecond = formData.get("includeBankAccount2") === "1";
  const account2: BankAccountFields = {
    id: optionalString(formData.get("bankAccountId2")),
    bankAccountName: optionalString(formData.get("bankAccountName2")) ?? null,
    bankAccountNumber: optionalString(formData.get("bankAccountNumber2")) ?? null,
    bankName: optionalString(formData.get("bankName2")) ?? null,
    promptpayNumber: optionalString(formData.get("promptpayNumber2")) ?? null,
  };

  const accounts = [account1];
  if (includeSecond && hasAnyBankField(account2)) {
    accounts.push(account2);
  }
  return accounts;
}
