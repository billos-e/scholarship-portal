import { useEffect, useState } from "react";
import { UserProfile, SignIn, useUser } from "@clerk/react";
import { getCurrentUser } from "@/lib/auth/session";
import { clerkLightAppearance } from "@/lib/clerk-appearance";
import { apiCreateAdmin, apiListAdmins, type AdminListItem } from "@/lib/auth/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/layout/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getInitials } from "@/lib/initials";

function formatLastLogin(iso: string | null): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function AddAdminModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ email: string; generatedPassword: string } | null>(
    null,
  );

  useEffect(() => {
    if (!open) {
      setEmail("");
      setError(null);
      setResult(null);
      setLoading(false);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiCreateAdmin(email.trim());
      setResult(res);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create admin account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an admin</DialogTitle>
          <DialogDescription>
            Invite a new administrator by email. They&apos;ll receive a temporary password to
            sign in with.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="new-admin-email" className="mb-1.5 block">
                Email address
              </Label>
              <Input
                id="new-admin-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending…" : "Send"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <p className="font-medium text-foreground">Admin account created for {result.email}</p>
              <p className="mt-1 text-muted-foreground">
                Share this temporary password with them securely. They should sign in and change
                it right away.
              </p>
              <p className="mt-2 rounded-md bg-background px-3 py-2 font-mono text-sm">
                {result.generatedPassword}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AdminAccountModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const adminEmail = getCurrentUser()?.email ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>Manage your email address and password.</DialogDescription>
        </DialogHeader>
        <UserProfile routing="hash" appearance={clerkLightAppearance} />
        {!adminEmail && (
          <SignIn
            routing="hash"
            signUpUrl={undefined}
            appearance={clerkLightAppearance}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminSettingsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const adminEmail = getCurrentUser()?.email?.toLowerCase().trim() ?? "";

  const [admins, setAdmins] = useState<AdminListItem[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  async function loadAdmins() {
    setLoadingAdmins(true);
    setLoadError(null);
    try {
      const list = await apiListAdmins();
      setAdmins(list);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load admin accounts.");
    } finally {
      setLoadingAdmins(false);
    }
  }

  useEffect(() => {
    if (isSignedIn) {
      loadAdmins();
    }
  }, [isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sidebar-admin-foreground/50 text-sm">Loading…</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-md py-10">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Account Credentials</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with Clerk to manage your email address and password.
          </p>
        </div>
        <SignIn
          routing="hash"
          signUpUrl={undefined}
          initialValues={{ emailAddress: adminEmail }}
          appearance={clerkLightAppearance}
        />
      </div>
    );
  }

  return (
    <div className="py-6">
      <PageHeader
        title="Administration"
        description="Manage administrator accounts for the portal."
        actions={<Button onClick={() => setAddOpen(true)}>+ Add admin</Button>}
      />

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        {loadingAdmins ? (
          <div className="p-6 text-sm text-muted-foreground">Loading admins…</div>
        ) : loadError ? (
          <div className="p-6 text-sm text-destructive">{loadError}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Last login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => {
                const isSelf = admin.email.toLowerCase().trim() === adminEmail;
                return (
                  <TableRow
                    key={admin.id}
                    className={isSelf ? "cursor-pointer" : "cursor-default"}
                    onClick={() => {
                      if (isSelf) setAccountOpen(true);
                    }}
                  >
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={admin.imageUrl ?? undefined} alt={admin.email} />
                        <AvatarFallback>{getInitials(admin.email.split("@")[0])}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {admin.email}
                      {isSelf && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatLastLogin(admin.lastLoginAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <AddAdminModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={() => {
          loadAdmins();
        }}
      />
      <AdminAccountModal open={accountOpen} onOpenChange={setAccountOpen} />
    </div>
  );
}
