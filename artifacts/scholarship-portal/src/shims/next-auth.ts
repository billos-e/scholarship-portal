type StubAuthResult = {
  handlers: Record<string, unknown>;
  auth: (...args: unknown[]) => Promise<null>;
  signIn: (...args: unknown[]) => Promise<void>;
  signOut: (...args: unknown[]) => Promise<void>;
  unstable_update: (...args: unknown[]) => Promise<null>;
};

export default function NextAuth(_config?: unknown): StubAuthResult {
  return {
    handlers: {},
    auth: async () => null,
    signIn: async () => {},
    signOut: async () => {},
    unstable_update: async () => null,
  };
}

export class AuthError extends Error {
  type = "AuthError";
}

export class CredentialsSignin extends AuthError {
  code = "credentials";
}
