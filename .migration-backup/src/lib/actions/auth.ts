"use server";

import { AuthError } from "next-auth";

import { DatabaseUnavailableError, isDatabaseUnavailable } from "@/lib/db/errors";
import { signIn } from "@/auth";

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
    if (
      error instanceof DatabaseUnavailableError ||
      isDatabaseUnavailable(error)
    ) {
      return {
        error:
          "Sign-in is temporarily unavailable. Please try again in a few minutes.",
      };
    }
    // signIn throws a redirect on success; re-throw so Next.js can handle it.
    throw error;
  }
}
