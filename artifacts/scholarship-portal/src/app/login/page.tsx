"use client";

import Image from "next/image";
import { GraduationCap, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { BrandMark } from "@/components/layout/brand-mark";
import { LoginFeatureList } from "./login-feature-list";
import { LoginForm } from "./login-form";
import { AdminClerkLogin } from "./admin-clerk-login";

type LoginMode = "student" | "admin";

const MODE_KEY = "login_mode";

function getInitialMode(): LoginMode {
  try {
    const stored = sessionStorage.getItem(MODE_KEY);
    if (stored === "admin" || stored === "student") return stored;
  } catch {
  }
  return "student";
}

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>(getInitialMode);

  function handleSetMode(next: LoginMode) {
    try {
      sessionStorage.setItem(MODE_KEY, next);
    } catch {
    }
    setMode(next);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col">
        <Image
          src="/images/login-hero.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/70" />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <GraduationCap className="size-6 text-white" />
            </span>
            <span className="font-heading text-2xl font-bold">
              Scholarship Portal
            </span>
          </div>

          <div className="max-w-md space-y-4">
            <h1 className="font-heading text-[2.5rem] font-bold leading-tight text-white">
              Your scholarship,
              <br />
              simplified.
            </h1>
            <p className="text-lg text-white/75">
              Manage your scholarship journey in one secure place.
            </p>
          </div>

          <LoginFeatureList />

          <p className="text-xs text-white/35">
            Scholarship management portal
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-background px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="lg:hidden">
            <BrandMark size="md" className="mb-4" />
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Scholarship Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account
            </p>
          </div>

          <div className="hidden space-y-2 lg:block">
            <h2 className="font-heading text-[1.75rem] font-bold tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "student"
                ? "Enter your email and password to continue."
                : "Sign in with your admin credentials."}
            </p>
          </div>

          {/* Login mode toggle */}
          <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => handleSetMode("student")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all",
                mode === "student"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="size-4" />
              Student Login
            </button>
            <button
              type="button"
              onClick={() => handleSetMode("admin")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all",
                mode === "admin"
                  ? "bg-[#6b1140] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ShieldCheck className="size-4" />
              Admin Login
            </button>
          </div>

          {mode === "student" ? (
            <LoginForm />
          ) : (
            <AdminClerkLogin />
          )}
        </div>
      </div>
    </div>
  );
}
