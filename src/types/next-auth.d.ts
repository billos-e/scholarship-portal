import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    studentProfileId?: string;
    firstName?: string;
    lastName?: string;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      studentProfileId?: string;
      firstName?: string;
      lastName?: string;
      displayName?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    studentProfileId?: string;
    firstName?: string;
    lastName?: string;
  }
}
