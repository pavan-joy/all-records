import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/apiAuth";
import { totpCodeSchema } from "@/lib/validations";
import { verifyTotpToken } from "@/lib/totp";
import AdminUser from "@/models/AdminUser";

export async function POST(request: Request) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = totpCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const user = await AdminUser.findById(auth.session!.user.id).select("+twoFactorPendingSecret");
  if (!user?.twoFactorPendingSecret) {
    return NextResponse.json({ message: "No enrollment in progress. Start setup again." }, { status: 400 });
  }

  if (!verifyTotpToken(user.twoFactorPendingSecret, parsed.data.code)) {
    return NextResponse.json({ message: "Invalid authenticator code." }, { status: 400 });
  }

  await AdminUser.findByIdAndUpdate(auth.session!.user.id, {
    $set: {
      twoFactorSecret: user.twoFactorPendingSecret,
      twoFactorEnabled: true,
    },
    $unset: { twoFactorPendingSecret: "" },
  });

  return NextResponse.json({ ok: true });
}
