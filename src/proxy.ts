import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

export const { auth: proxy } = NextAuth(authConfig);

// Route access checks are handled by the `authorized` callback in auth.config.ts.
export default proxy(() => {});

export const config = {
  // Protect everything except Next.js internals, the auth API, logout, and static files.
  matcher: [
    "/((?!api/auth|api/logout|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
