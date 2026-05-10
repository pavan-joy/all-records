import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/apiAuth";
import { generateTotpSecretBase32, getTotpKeyUri } from "@/lib/totp";
import AdminUser from "@/models/AdminUser";

export async function POST() {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const user = await AdminUser.findById(auth.session!.user.id).select("email twoFactorEnabled");
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  if (user.twoFactorEnabled) {
    return NextResponse.json(
      { message: "Turn off two-factor authentication before generating a new setup." },
      { status: 400 },
    );
  }

  const secret = generateTotpSecretBase32();
  await AdminUser.findByIdAndUpdate(auth.session!.user.id, {
    $set: { twoFactorPendingSecret: secret },
  });

  const otpauthUrl = getTotpKeyUri(secret, user.email);
  return NextResponse.json({
    otpauthUrl,
    secretBase32: secret,
  });
}
