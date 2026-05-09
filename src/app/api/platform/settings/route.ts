import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/apiAuth";
import { connectToDatabase } from "@/lib/mongodb";
import { getOrCreatePlatformSettings } from "@/lib/platformSettings";
import PlatformSettings from "@/models/PlatformSettings";

const putSchema = z.object({
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().min(1).max(65535).optional(),
  smtpSecure: z.boolean().optional(),
  smtpUser: z.string().optional(),
  /** Empty string keeps existing password */
  smtpPassword: z.string().optional(),
  alertsEnabled: z.boolean().optional(),
  alertRecipients: z.array(z.string().email()).optional(),
  subscriptionAlertDays: z.coerce.number().min(1).max(365).optional(),
  firewallAlertDays: z.coerce.number().min(1).max(365).optional(),
});

export async function GET() {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.error;

  await connectToDatabase();
  await getOrCreatePlatformSettings();

  const doc = await PlatformSettings.findOne().lean();
  const withSecret = await PlatformSettings.findOne().select("+smtpPassword").lean();
  const smtpPasswordSet = !!(withSecret && (withSecret as { smtpPassword?: string }).smtpPassword);

  if (!doc) {
    return NextResponse.json({ message: "Settings not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...doc,
      smtpPasswordSet,
    },
  });
}

export async function PUT(request: Request) {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.error;

  const json = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
  }

  await connectToDatabase();
  let doc = await PlatformSettings.findOne().select("+smtpPassword");
  if (!doc) {
    await getOrCreatePlatformSettings();
    doc = await PlatformSettings.findOne().select("+smtpPassword");
  }
  if (!doc) {
    return NextResponse.json({ message: "Could not load settings" }, { status: 500 });
  }

  const b = parsed.data;
  if (b.smtpHost !== undefined) {
    doc.smtpHost = b.smtpHost
      .trim()
      .replace(/^smtp:\/\//i, "")
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "");
  }
  if (b.smtpPort !== undefined) doc.smtpPort = b.smtpPort;
  if (b.smtpSecure !== undefined) doc.smtpSecure = b.smtpSecure;
  if (b.smtpUser !== undefined) doc.smtpUser = b.smtpUser;
  if (b.smtpPassword !== undefined && b.smtpPassword !== "") {
    doc.set("smtpPassword", b.smtpPassword);
  }
  if (b.alertsEnabled !== undefined) doc.alertsEnabled = b.alertsEnabled;
  if (b.alertRecipients !== undefined) doc.alertRecipients = b.alertRecipients;
  if (b.subscriptionAlertDays !== undefined) doc.subscriptionAlertDays = b.subscriptionAlertDays;
  if (b.firewallAlertDays !== undefined) doc.firewallAlertDays = b.firewallAlertDays;

  await doc.save();

  const withSecret = await PlatformSettings.findOne().select("+smtpPassword").lean();
  const smtpPasswordSet = !!(withSecret && (withSecret as { smtpPassword?: string }).smtpPassword);

  const lean = doc.toObject();
  delete (lean as { smtpPassword?: string }).smtpPassword;

  return NextResponse.json({
    data: {
      ...lean,
      smtpPasswordSet,
    },
  });
}
