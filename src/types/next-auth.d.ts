import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "NANNY" | "FAMILY" | "ADMIN";
    fullName: string;
  }

  interface Session {
    user: {
      id: string;
      role: "NANNY" | "FAMILY" | "ADMIN";
      fullName: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "NANNY" | "FAMILY" | "ADMIN";
    fullName: string;
  }
}
