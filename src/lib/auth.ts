import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AdminUser from "@/models/AdminUser";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyTotpToken } from "@/lib/totp";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "Authenticator code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        await connectToDatabase();
        const user = await AdminUser.findOne({
          email: credentials.email.toLowerCase(),
          status: "Active",
        }).select("+passwordHash +twoFactorSecret");

        if (!user) return null;

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        const secret = user.twoFactorSecret ? String(user.twoFactorSecret) : "";
        const needsTotp = Boolean(user.twoFactorEnabled && secret);
        if (needsTotp) {
          const totpCode =
            typeof credentials.totp === "string" ? credentials.totp.trim().replace(/\s/g, "") : "";
          if (!totpCode || !verifyTotpToken(secret, totpCode)) {
            return null;
          }
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: "SUPER_ADMIN" | "ADMIN" | "READ_ONLY" }).role;
        token.status = (user as { status: "Active" | "Inactive" }).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "SUPER_ADMIN" | "ADMIN" | "READ_ONLY";
        session.user.status = token.status as "Active" | "Inactive";
      }
      return session;
    },
  },
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}
