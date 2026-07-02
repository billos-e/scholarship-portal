import type { Role } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth configuration shared between the middleware and the full
 * Node runtime config. It must NOT import Prisma, bcrypt, or anything that
 * relies on Node APIs, so that it can run in the Edge middleware.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  // Providers with their `authorize` logic are added in `auth.ts` (Node runtime).
  providers: [],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as Role;
        if (user.studentProfileId) {
          token.studentProfileId = user.studentProfileId;
        }
        if (user.firstName) {
          token.firstName = user.firstName;
          token.lastName = user.lastName;
        }
      }

      if (trigger === "update" && session) {
        const updated = session as {
          user?: { firstName?: string; lastName?: string };
          firstName?: string;
          lastName?: string;
        };
        const firstName = updated.user?.firstName ?? updated.firstName;
        const lastName = updated.user?.lastName ?? updated.lastName;
        if (firstName) token.firstName = firstName;
        if (lastName) token.lastName = lastName;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        if (token.studentProfileId) {
          session.user.studentProfileId = token.studentProfileId as string;
        }
        if (token.firstName && token.lastName) {
          session.user.firstName = token.firstName as string;
          session.user.lastName = token.lastName as string;
          session.user.displayName = `${token.firstName} ${token.lastName}`;
        }
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = nextUrl;

      const isAdminArea = pathname.startsWith("/admin");
      const isStudentArea = pathname.startsWith("/student");

      // Authenticated users hitting the login page go to their home.
      if (pathname === "/login") {
        if (isLoggedIn) {
          const home = role === "ADMIN" ? "/admin" : "/student";
          return Response.redirect(new URL(home, nextUrl));
        }
        return true;
      }

      if (isAdminArea) {
        if (!isLoggedIn) return false;
        if (role !== "ADMIN") {
          return Response.redirect(new URL("/student", nextUrl));
        }
        return true;
      }

      if (isStudentArea) {
        if (!isLoggedIn) return false;
        if (role !== "STUDENT") {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
