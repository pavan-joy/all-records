import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "SUPER_ADMIN" | "ADMIN" | "READ_ONLY";
      status: "Active" | "Inactive";
    } & DefaultSession["user"];
  }

  interface User {
    role: "SUPER_ADMIN" | "ADMIN" | "READ_ONLY";
    status: "Active" | "Inactive";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "READ_ONLY";
    status?: "Active" | "Inactive";
  }
}
