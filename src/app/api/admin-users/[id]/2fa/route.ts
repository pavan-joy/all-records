import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireSuperAdmin } from "@/lib/apiAuth";
import { generateTotpSecretBase32, getTotpKeyUri } from "@/lib/totp";
import AdminUser from "@/models/AdminUser";

type Params = { params: Promise<{ id: string }> };

type Body = {
  action?: string;
};

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.error;

  const body = (await request.json()) as Body;
  const action = body.action;

  if (action !== "reset" && action !== "provision") {
    return NextResponse.json({ message: "Invalid action. Use reset or provision." }, { status: 400 });
  }

  await connectToDatabase();
  const { id } = await params;

  const target = await AdminUser.findById(id).select("email name");
  if (!target) return NextResponse.json({ message: "Admin user not found" }, { status: 404 });

  if (action === "reset") {
    await AdminUser.findByIdAndUpdate(id, {
      $set: { twoFactorEnabled: false },
      $unset: {
        twoFactorSecret: "",
        twoFactorPendingSecret: "",
      },
    });
    return NextResponse.json({
      ok: true,
      message: `Two-factor authentication cleared for ${target.email}.`,
    });
  }

  const secret = generateTotpSecretBase32();
  await AdminUser.findByIdAndUpdate(id, {
    $set: {
      twoFactorEnabled: false,
      twoFactorPendingSecret: secret,
    },
    $unset: { twoFactorSecret: "" },
  });

  const otpauthUrl = getTotpKeyUri(secret, target.email);
  return NextResponse.json({
    ok: true,
    email: target.email,
    name: target.name,
    otpauthUrl,
    secretBase32: secret,
    instructions:
      "Share the QR or secret securely. The user must open Security → complete enrollment with a 6-digit code before 2FA is enforced at sign-in.",
  });
}
