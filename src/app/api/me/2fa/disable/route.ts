import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/apiAuth";
import { disableTwoFactorSchema } from "@/lib/validations";
import { verifyTotpToken } from "@/lib/totp";
import AdminUser from "@/models/AdminUser";

export async function POST(request: Request) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = disableTwoFactorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const user = await AdminUser.findById(auth.session!.user.id).select(
    "+passwordHash +twoFactorSecret twoFactorEnabled",
  );
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const passwordOk = await compare(parsed.data.password, user.passwordHash);
  if (!passwordOk) {
    return NextResponse.json({ message: "Invalid password." }, { status: 401 });
  }

  if (user.twoFactorEnabled && user.twoFactorSecret) {
    const totp = parsed.data.totp?.trim().replace(/\s/g, "") ?? "";
    if (!totp || !verifyTotpToken(user.twoFactorSecret, totp)) {
      return NextResponse.json({ message: "Enter a valid 6-digit authenticator code." }, { status: 400 });
    }
  }

  await AdminUser.findByIdAndUpdate(auth.session!.user.id, {
    $set: { twoFactorEnabled: false },
    $unset: {
      twoFactorSecret: "",
      twoFactorPendingSecret: "",
    },
  });

  return NextResponse.json({ ok: true });
}
