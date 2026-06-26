import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIES = [
  { name: "authjs.session-token", secure: false },
  { name: "__Secure-authjs.session-token", secure: true },
  { name: "__Host-authjs.session-token", secure: true },
] as const;

/** Use the public host Netlify forwards, not the internal deploy URL. */
function resolvePublicOrigin(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return new URL(request.url).origin;
}

/**
 * Explicit logout route kept outside the auth proxy matcher.
 * Avoids Netlify duplicate Set-Cookie headers from middleware + signOut().
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();

  for (const { name, secure } of SESSION_COOKIES) {
    cookieStore.set(name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure,
    });
  }

  return NextResponse.redirect(new URL("/login", resolvePublicOrigin(request)));
}
