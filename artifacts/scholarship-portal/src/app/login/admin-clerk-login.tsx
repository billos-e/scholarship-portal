"use client";

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { SignIn, useUser, useClerk } from "@clerk/react";
import { dark } from "@clerk/themes";
import { apiClerkAdminSession, saveSession } from "@/lib/auth/api";

export function AdminClerkLogin() {
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [, navigate] = useLocation();
  const [bridging, setBridging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !isSignedIn || bridging) return;

    setBridging(true);
    apiClerkAdminSession()
      .then((user) => {
        saveSession(user);
        navigate("/admin");
      })
      .catch(async (err) => {
        setError(err?.message ?? "Access denied.");
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
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <SignIn
        routing="hash"
        signUpUrl={undefined}
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: "#851651",
            colorBackground: "#140810",
            colorForeground: "#f5d0e4",
            colorMutedForeground: "#c08aaa",
            colorDanger: "#b3402f",
            colorInput: "#2d1020",
            colorInputForeground: "#f5d0e4",
            colorNeutral: "#6b1140",
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            borderRadius: "0.75rem",
          },
          elements: {
            rootBox: "w-full",
            cardBox: "w-full rounded-xl overflow-hidden shadow-none",
            card: "!shadow-none !border-0 !bg-[#140810] !rounded-none",
            footer: "!shadow-none !border-0 !bg-[#140810] !rounded-none",
            headerTitle: "text-[#f5d0e4]",
            headerSubtitle: "text-[#c08aaa]",
            formFieldLabel: "text-[#f5d0e4]",
            formFieldInput: "bg-[#2d1020] border-[#6b1140] text-[#f5d0e4]",
            formButtonPrimary: "bg-[#851651] hover:bg-[#9d174d] text-white",
            footerActionText: "text-[#c08aaa]",
            footerActionLink: "text-[#f5d0e4] hover:text-white",
            dividerText: "text-[#c08aaa]",
            dividerLine: "bg-[#6b1140]",
            socialButtonsBlockButtonText: "text-[#f5d0e4]",
            identityPreviewEditButton: "text-[#f5d0e4]",
            formFieldSuccessText: "text-green-400",
            alertText: "text-[#f5d0e4]",
            alert: "bg-[#2d1020] border-[#851651]",
            otpCodeFieldInput: "bg-[#2d1020] border-[#6b1140] text-[#f5d0e4]",
            footerAction: "bg-[#140810]",
            logoBox: "hidden",
            main: "",
            formFieldRow: "",
            socialButtonsBlockButton: "border-[#6b1140] bg-[#2d1020] hover:bg-[#3d1828]",
          },
        }}
      />
    </div>
  );
}
