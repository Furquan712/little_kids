import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Email ou telefone", type: "text" },
        password: { label: "Palavra-passe", type: "password" },
      },
      authorize: async (credentials) => {
        const identifier = credentials?.identifier;
        const password = credentials?.password;

        if (typeof identifier !== "string" || typeof password !== "string") {
          return null;
        }

        await connectToDatabase();

        const normalized = identifier.trim().toLowerCase();
        const userDoc = await User.findOne({
          $or: [{ email: normalized }, { phone: identifier.trim() }],
        });

        if (!userDoc) return null;
        if (userDoc.status !== "ACTIVE") return null;

        const passwordMatches = await bcrypt.compare(password, userDoc.passwordHash);
        if (!passwordMatches) return null;

        return {
          id: userDoc._id.toString(),
          role: userDoc.role,
          fullName: userDoc.fullName,
        };
      },
    }),
  ],
});
