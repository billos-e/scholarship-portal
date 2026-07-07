import { UserProfile, SignIn, useUser } from "@clerk/react";
import { dark } from "@clerk/themes";
import { getCurrentUser } from "@/lib/auth/session";

export default function AdminSettingsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const adminEmail = getCurrentUser()?.email ?? "";

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
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#851651",
              colorBackground: "#1a0b14",
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
              cardBox: "w-full rounded-xl overflow-hidden",
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

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Account Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your email address and password.
        </p>
      </div>
      <UserProfile
        routing="hash"
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: "#851651",
            colorBackground: "#1a0b14",
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
            cardBox: "w-full rounded-xl overflow-hidden",
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
