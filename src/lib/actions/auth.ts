"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";

export type LoginState = { error?: string };

export async function authenticate(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password, or your account is disabled." };
    }
    // signIn throws a redirect on success; re-throw so Next.js can handle it.
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
