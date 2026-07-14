import Image from "next/image";
import { CreditCard } from "lucide-react";

import { CopyableValue } from "@/components/admin/copyable-value";
import { uploadPublicUrl } from "@/lib/upload-path";
import { cn } from "@/lib/utils";

type BankCardProps = {
  accountName: string | null;
  accountNumber: string | null;
  bankName: string | null;
  promptpayNumber: string | null;
  qrImageUrl: string | null;
  className?: string;
};

function formatAccountNumber(value: string | null): string {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return value;
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function rawAccountNumber(value: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length > 0 ? digits : value;
}

export function BankCard({
  accountName,
  accountNumber,
  bankName,
  promptpayNumber,
  qrImageUrl,
  className,
}: BankCardProps) {
  const accountNumberRaw = rawAccountNumber(accountNumber);

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card px-5 py-4 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-orange-light text-accent">
          <CreditCard className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Bank account
                </p>
                <p className="font-heading text-base font-semibold text-foreground">
                  {bankName ?? "Unknown bank"}
                </p>
              </div>
              <CopyableValue
                label="Account number"
                value={accountNumberRaw}
                display={formatAccountNumber(accountNumber)}
                mono
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Account holder
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {accountName ?? "—"}
                </p>
              </div>
              {promptpayNumber ? (
                <CopyableValue label="PromptPay" value={promptpayNumber} />
              ) : null}
            </div>
          </div>
        </div>

        {qrImageUrl ? (
          <a
            href={uploadPublicUrl(qrImageUrl)}
            target="_blank"
            rel="noreferrer noopener"
            className="group shrink-0 self-start overflow-hidden rounded-lg border border-border bg-background p-1 shadow-sm transition-colors hover:border-primary/30"
            title="Open QR payment image"
          >
            <Image
              src={uploadPublicUrl(qrImageUrl)}
              alt="QR payment code"
              width={56}
              height={56}
              className="size-14 object-cover"
              unoptimized
            />
          </a>
        ) : null}
      </div>
    </div>
  );
}
