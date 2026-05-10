import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/apiAuth";
import { getTotpKeyUri } from "@/lib/totp";
import AdminUser from "@/models/AdminUser";

export async function GET() {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const user = await AdminUser.findById(auth.session!.user.id)
    .select("+twoFactorPendingSecret twoFactorEnabled email")
    .lean();

  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const pendingSecret = (user as { twoFactorPendingSecret?: string }).twoFactorPendingSecret;
  const pending = Boolean(pendingSecret);
  const email = String((user as { email?: string }).email ?? "");

  let otpauthUrl: string | undefined;
  let secretBase32: string | undefined;
  if (pending && pendingSecret && email && !user.twoFactorEnabled) {
    secretBase32 = pendingSecret;
    otpauthUrl = getTotpKeyUri(pendingSecret, email);
  }

  return NextResponse.json({
    twoFactorEnabled: Boolean(user.twoFactorEnabled),
    pendingEnrollment: pending,
    otpauthUrl,
    secretBase32,
  });
}
