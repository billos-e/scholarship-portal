import * as React from "react";

export async function signIn(..._args: unknown[]): Promise<{ ok: boolean; error: null }> {
  return { ok: true, error: null };
}

export async function signOut(..._args: unknown[]): Promise<void> {}

export function useSession() {
  return { data: null, status: "unauthenticated" as const, update: async () => null };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}

export function getSession() {
  return Promise.resolve(null);
}
