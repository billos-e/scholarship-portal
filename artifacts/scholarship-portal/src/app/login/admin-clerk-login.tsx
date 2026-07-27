"use client";

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { SignIn, useUser, useClerk, useAuth } from "@clerk/react";
import { toast } from "sonner";
import { apiClerkAdminSession, saveSession } from "@/lib/auth/api";

function friendlyError(msg: string): string {
  if (msg.includes("No active account found")) {
    return "You haven't been added as an admin yet. Ask your administrator to add your account before signing in.";
  }
  return "Access denied. Please contact your administrator.";
}

export function AdminClerkLogin() {
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const [, navigate] = useLocation();
  const [bridging, setBridging] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || bridging) return;

    setBridging(true);
    getToken()
      .then((token) => apiClerkAdminSession(token))
      .then((user) => {
        saveSession(user);
        navigate("/admin");
      })
      .catch(async (err) => {
        toast.error(friendlyError(err?.message ?? ""), { duration: 8000 });
        await signOut();
        setBridging(false);
      });
  }, [isLoaded, isSignedIn, bridging, navigate, signOut]);

  if (!isLoaded || bridging) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Signing you in…
      </div>
    );
  }

  if (isSignedIn) return null;

  return (
    <div className="space-y-4">
      <SignIn
        routing="hash"
        signUpUrl={undefined}
        appearance={{
          variables: {
            colorPrimary: "#851651",
            colorBackground: "#ffffff",
            colorForeground: "#0f0a0d",
            colorMutedForeground: "#6b7280",
            colorDanger: "#b3402f",
            colorInput: "#ffffff",
            colorInputForeground: "#0f0a0d",
            colorNeutral: "#6b1140",
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            borderRadius: "0.75rem",
          },
          elements: {
            rootBox: "w-full",
            cardBox: "w-full rounded-xl overflow-hidden shadow-none",
            card: "!shadow-none !border-0 !bg-transparent !rounded-none",
            footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            formFieldLabel: "text-foreground",
            formFieldInput: "bg-white border-border text-foreground",
            formButtonPrimary: "bg-[#851651] hover:bg-[#6b1140] text-white",
            footerActionText: "text-muted-foreground",
            footerActionLink: "text-[#851651] hover:text-[#6b1140]",
            dividerText: "text-muted-foreground",
            dividerLine: "bg-border",
            socialButtonsBlockButtonText: "text-foreground",
            identityPreviewEditButton: "text-[#851651]",
            formFieldSuccessText: "text-green-600",
            alertText: "text-foreground",
            alert: "bg-destructive/10 border-destructive/30",
            otpCodeFieldInput: "bg-white border-border text-foreground",
            footerAction: "!hidden",
            logoBox: "hidden",
            main: "",
            formFieldRow: "",
            socialButtonsBlockButton: "border-border bg-white hover:bg-muted",
          },
        }}
      />
    </div>
  );
}
