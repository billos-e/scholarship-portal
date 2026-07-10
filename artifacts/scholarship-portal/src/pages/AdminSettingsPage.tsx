import { useRef, useState } from "react";
import { UserProfile, SignIn, useUser } from "@clerk/react";
import { getCurrentUser } from "@/lib/auth/session";
import { clerkLightAppearance } from "@/lib/clerk-appearance";
import { apiCreateAdmin } from "@/lib/auth/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function AddAdminForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ email: string; generatedPassword: string } | null>(
    null,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiCreateAdmin(email.trim());
      setResult(res);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create admin account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Add an admin</CardTitle>
        <CardDescription>
          Invite a new administrator by email. They'll receive a temporary password to sign in
          with.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
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
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding…" : "Add admin"}
          </Button>
        </form>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        {result && (
          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <p className="font-medium text-foreground">
              Admin account created for {result.email}
            </p>
            <p className="mt-1 text-muted-foreground">
              Share this temporary password with them securely. They should sign in and change it
              right away.
            </p>
            <p className="mt-2 rounded-md bg-background px-3 py-2 font-mono text-sm">
              {result.generatedPassword}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminSettingsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const adminEmail = getCurrentUser()?.email ?? "";
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div className="py-6" ref={containerRef}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Account Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your email address and password.
        </p>
      </div>
      <UserProfile
        routing="hash"
        appearance={clerkLightAppearance}
      />
      <AddAdminForm />
    </div>
  );
}
