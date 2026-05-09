import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/apiAuth";
import { connectToDatabase } from "@/lib/mongodb";
import { createMailTransport } from "@/lib/smtp";
import PlatformSettings from "@/models/PlatformSettings";

const bodySchema = z.object({
  to: z.string().email().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().min(1).max(65535).optional(),
  smtpSecure: z.boolean().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
});

export async function POST(request: Request) {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.error;

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
  }

  await connectToDatabase();
  const doc = await PlatformSettings.findOne().select("+smtpPassword");
  if (!doc) {
    return NextResponse.json({ message: "Save SMTP settings first." }, { status: 400 });
  }

  const recipients = (doc.alertRecipients || []).map((e) => e.trim()).filter(Boolean);
  const to =
    parsed.data.to?.trim() ||
    recipients[0] ||
    parsed.data.smtpUser?.trim() ||
    doc.smtpUser?.trim();
  if (!to) {
    return NextResponse.json(
      { message: "Provide a test email, or configure alert recipients / SMTP username." },
      { status: 400 },
    );
  }

  try {
    const dbPass = String(doc.get("smtpPassword") ?? "");
    const smtpHost = parsed.data.smtpHost?.trim() || doc.smtpHost;
    const smtpPort = parsed.data.smtpPort ?? doc.smtpPort;
    const smtpSecure = parsed.data.smtpSecure ?? doc.smtpSecure;
    const smtpUser = parsed.data.smtpUser?.trim() || doc.smtpUser;
    const smtpPassword = parsed.data.smtpPassword?.trim() ? parsed.data.smtpPassword : dbPass;

    const transport = createMailTransport({
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPassword,
    });
    const fromAddr = smtpUser?.trim() || `noreply@${smtpHost}`;
    await transport.sendMail({
      from: fromAddr,
      to,
      subject: "IT Asset Portal — SMTP test",
      text: "Your SMTP configuration is working.",
      html: "<p>Your <strong>SMTP configuration</strong> is working.</p>",
    });
  } catch (e) {
    const code =
      typeof e === "object" && e !== null && "code" in e ? String((e as { code?: unknown }).code ?? "") : "";
    let msg = e instanceof Error ? e.message : "Failed to send email.";
    if (code === "EDNS" || code === "ENOTFOUND" || code === "EBADNAME") {
      msg =
        "SMTP host could not be resolved. For Google Workspace/Gmail use host smtp.gmail.com (no http/https), port 587 with TLS unchecked in this screen (STARTTLS) or port 465 with secure enabled.";
    }
    return NextResponse.json({ message: msg }, { status: 400 });
  }

  return NextResponse.json({ data: { ok: true, sentTo: to } });
}
