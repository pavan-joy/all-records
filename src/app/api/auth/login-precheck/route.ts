import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await AdminUser.findOne({ email, status: "Active" }).select(
      "+passwordHash +twoFactorSecret twoFactorEnabled",
    );

    if (!user || !(await compare(password, user.passwordHash))) {
      return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
    }

    const requiresTwoFactor = Boolean(user.twoFactorEnabled && user.twoFactorSecret);
    return NextResponse.json({ ok: true, requiresTwoFactor });
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid credentials" }, { status: 401 });
  }
}
