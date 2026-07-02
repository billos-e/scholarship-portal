import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { authConfig } from "@/auth.config";
import {
  DatabaseUnavailableError,
  isDatabaseUnavailable,
} from "@/lib/db/errors";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        try {
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          // Reject unknown users, disabled accounts, and bad passwords.
          if (!user || !user.isActive) return null;

          const valid = await verifyPassword(password, user.passwordHash);
          if (!valid) return null;

          if (user.role === "STUDENT") {
            const student = await prisma.student.findUnique({
              where: { userId: user.id },
              select: { id: true, firstName: true, lastName: true },
            });
            if (!student) return null;

            return {
              id: user.id,
              email: user.email,
              role: user.role,
              studentProfileId: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
            };
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          if (isDatabaseUnavailable(error)) {
            throw new DatabaseUnavailableError();
          }
          throw error;
        }
      },
    }),
  ],
});
