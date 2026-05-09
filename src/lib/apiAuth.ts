import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

export async function requireApiAuth() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null };
}

export async function requireSuperAdmin() {
  const auth = await requireApiAuth();
  if (auth.error) return auth;

  if (auth.session?.user.role !== "SUPER_ADMIN") {
    return {
      session: null,
      error: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }

  return auth;
}

export async function requireWriteAccess() {
  const auth = await requireApiAuth();
  if (auth.error) return auth;

  if (auth.session?.user.role === "READ_ONLY") {
    return {
      session: null,
      error: NextResponse.json({ message: "Forbidden: read-only user cannot modify data." }, { status: 403 }),
    };
  }

  return auth;
}
