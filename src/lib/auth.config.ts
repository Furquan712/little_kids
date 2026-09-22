import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe config (no Credentials provider here — bcrypt/mongoose are
 * Node-only). Used directly by middleware; extended with the provider in
 * auth.ts for route handlers and server actions.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.fullName = user.fullName;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as "NANNY" | "FAMILY" | "ADMIN";
      session.user.fullName = token.fullName as string;
      return session;
    },
  },
};
