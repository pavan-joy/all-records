import nodemailer from "nodemailer";
import type { IPlatformSettings } from "@/models/PlatformSettings";

function normalizeSmtpHost(input: string | undefined) {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  return raw
    .replace(/^smtp:\/\//i, "")
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .trim();
}

export function createMailTransport(settings: Pick<IPlatformSettings, "smtpHost" | "smtpPort" | "smtpSecure" | "smtpUser" | "smtpPassword">) {
  const host = normalizeSmtpHost(settings.smtpHost);
  if (!host) {
    throw new Error("SMTP host is not configured.");
  }
  if (/\s/.test(host) || host.includes("/") || host.includes(":")) {
    throw new Error("SMTP host is invalid. Use hostname only (example: smtp.gmail.com).");
  }
  const user = settings.smtpUser?.trim() ?? "";
  const pass = settings.smtpPassword || "";

  return nodemailer.createTransport({
    host,
    port: settings.smtpPort || 587,
    secure: settings.smtpSecure,
    auth: user && pass ? { user, pass } : undefined,
  });
}

export async function verifySmtp(settings: Parameters<typeof createMailTransport>[0]) {
  const transport = createMailTransport(settings);
  await transport.verify();
}
