import { ProfileInfoField, ProfileInfoGrid } from "@/components/admin/profile-info-field";
import { Badge } from "@/components/ui/badge";
import {
  hasAnyBankField,
  type BankAccountFields,
} from "@/lib/bank-accounts";

export function BankAccountsDisplay({
  accounts,
}: {
  accounts: BankAccountFields[];
}) {
  const visible = accounts.filter((account) => hasAnyBankField(account));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-6">
      {visible.map((account, index) => (
        <div key={account.id ?? index} className="space-y-3">
          {visible.length > 1 ? (
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account {index + 1}
              </p>
              {index === 0 ? (
                <Badge variant="secondary">Primary</Badge>
              ) : null}
            </div>
          ) : null}
          <ProfileInfoGrid>
            <ProfileInfoField label="Bank name" value={account.bankName} />
            <ProfileInfoField
              label="Account holder"
              value={account.bankAccountName}
            />
            <ProfileInfoField
              label="Account number"
              value={account.bankAccountNumber}
            />
            <ProfileInfoField
              label="PromptPay"
              value={account.promptpayNumber}
            />
          </ProfileInfoGrid>
        </div>
      ))}
    </div>
  );
}
