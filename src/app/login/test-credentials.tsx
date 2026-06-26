import { ChevronRight } from "lucide-react";

const TEST_ACCOUNTS = [
  {
    role: "Admin",
    email: "admin@example.com",
    password: "password123",
  },
  {
    role: "Student",
    email: "anong.saetang@example.com",
    password: "password123",
  },
] as const;

export function TestCredentials() {
  return (
    <details className="group rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-muted-foreground marker:content-none [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-4 shrink-0 transition-transform group-open:rotate-90" />
        Test credentials
      </summary>
      <ul className="mt-3 space-y-3 text-muted-foreground">
        {TEST_ACCOUNTS.map((account) => (
          <li key={account.email} className="space-y-1">
            <p className="font-medium text-foreground">{account.role}</p>
            <p>
              <span className="text-foreground/80">Email:</span>{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {account.email}
              </code>
            </p>
            <p>
              <span className="text-foreground/80">Password:</span>{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {account.password}
              </code>
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}
