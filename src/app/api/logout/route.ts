import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "__Host-authjs.session-token",
] as const;

/**
 * Explicit logout route kept outside the auth proxy matcher.
 * Avoids Netlify duplicate Set-Cookie headers from middleware + signOut().
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  for (const name of SESSION_COOKIES) {
    cookieStore.delete(name);
  }
  return NextResponse.redirect(new URL("/login", request.url));
}
