import { useRef } from "react";
import { UserProfile, SignIn, useUser } from "@clerk/react";
import { getCurrentUser } from "@/lib/auth/session";
import { clerkLightAppearance } from "@/lib/clerk-appearance";

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
    </div>
  );
}
