import { connectToDatabase } from "@/lib/mongodb";
import { createMailTransport } from "@/lib/smtp";
import Firewall from "@/models/Firewall";
import PlatformSettings from "@/models/PlatformSettings";
import Subscription from "@/models/Subscription";
import type { IPlatformSettings } from "@/models/PlatformSettings";

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function daysUntil(from: Date, target: Date) {
  const ms = target.getTime() - from.getTime();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function sameUtcCalendarDay(a: Date, b: Date) {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

export type ExpiryAlertResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  sent?: boolean;
  message?: string;
  subscriptions?: number;
  firewalls?: number;
};

async function loadSettingsWithSecrets(): Promise<IPlatformSettings | null> {
  await connectToDatabase();
  return PlatformSettings.findOne().select("+smtpPassword").lean();
}

export async function runExpiryAlertJob(options: { force?: boolean } = {}): Promise<ExpiryAlertResult> {
  const { force } = options;
  const raw = await loadSettingsWithSecrets();
  if (!raw) {
    return { ok: false, skipped: true, reason: "Platform settings not initialized." };
  }

  const settings = raw as IPlatformSettings;

  if (!settings.alertsEnabled) {
    return { ok: true, skipped: true, reason: "Expiry alerts are disabled." };
  }

  const recipients = (settings.alertRecipients || []).map((e) => e.trim()).filter(Boolean);
  if (recipients.length === 0) {
    return { ok: true, skipped: true, reason: "No alert recipients configured." };
  }

  if (!settings.smtpHost?.trim()) {
    return { ok: false, skipped: true, reason: "SMTP host is not configured." };
  }

  const now = new Date();
  if (!force && settings.lastExpiryDigestAt && sameUtcCalendarDay(new Date(settings.lastExpiryDigestAt), now)) {
    return {
      ok: true,
      skipped: true,
      reason: "A digest was already sent today (UTC). Use “Run now” with force from the UI or CRON_FORCE.",
    };
  }

  const subDays = settings.subscriptionAlertDays ?? 30;
  const fwDays = settings.firewallAlertDays ?? 30;
  const subHorizon = addDays(now, subDays);
  const fwHorizon = addDays(now, fwDays);

  const subs = await Subscription.find({
    status: "Active",
    renewalDate: { $exists: true, $ne: null, $lte: subHorizon },
  })
    .populate("vendorId", "name")
    .sort({ renewalDate: 1 })
    .limit(400)
    .lean();

  const fws = await Firewall.find({
    expiryDate: { $exists: true, $ne: null, $lte: fwHorizon },
  })
    .sort({ expiryDate: 1 })
    .limit(400)
    .lean();

  if (subs.length === 0 && fws.length === 0) {
    return {
      ok: true,
      skipped: true,
      sent: false,
      reason: "No subscriptions or firewalls in the alert window.",
      subscriptions: 0,
      firewalls: 0,
    };
  }

  let transport;
  try {
    transport = createMailTransport(settings);
  } catch (e) {
    return { ok: false, skipped: true, reason: e instanceof Error ? e.message : "SMTP configuration error." };
  }

  const appName = "IT Asset & Subscription Portal";
  const subject = `[${appName}] Expiry alert — ${subs.length} subscription(s), ${fws.length} firewall(s)`;

  const subRows = subs
    .map((s) => {
      const rd = s.renewalDate ? new Date(s.renewalDate) : null;
      const vendor =
        typeof s.vendorId === "object" && s.vendorId && "name" in s.vendorId
          ? String((s.vendorId as { name?: string }).name ?? "")
          : "";
      const days = rd ? daysUntil(now, rd) : "—";
      const state = rd && rd < now ? `<strong style="color:#b91c1c">Overdue</strong>` : `${days} day(s)`;
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${escapeHtml(s.name)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${escapeHtml(vendor)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${rd ? rd.toISOString().slice(0, 10) : "—"}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${state}</td>
      </tr>`;
    })
    .join("");

  const fwRows = fws
    .map((f) => {
      const ed = f.expiryDate ? new Date(f.expiryDate) : null;
      const days = ed ? daysUntil(now, ed) : "—";
      const state = ed && ed < now ? `<strong style="color:#b91c1c">Expired</strong>` : `${days} day(s)`;
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${escapeHtml(f.county)} / ${escapeHtml(f.branch)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${escapeHtml(f.serialNumber ?? "—")}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${ed ? ed.toISOString().slice(0, 10) : "—"}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${state}</td>
      </tr>`;
    })
    .join("");

  const html = `
  <div style="font-family:system-ui,Segoe UI,sans-serif;font-size:14px;color:#0f172a;line-height:1.5">
    <p style="margin:0 0 16px">This is an automated expiry digest from <strong>${escapeHtml(appName)}</strong>.</p>
    <p style="margin:0 0 12px;color:#475569">
      Active subscriptions with renewal on or before <strong>${subHorizon.toISOString().slice(0, 10)}</strong>
      (${subDays} day horizon). Firewalls with expiry on or before <strong>${fwHorizon.toISOString().slice(0, 10)}</strong>.
    </p>
    <h3 style="margin:24px 0 8px;font-size:15px">Subscriptions (${subs.length})</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <thead>
        <tr style="background:#f1f5f9;text-align:left">
          <th style="padding:8px;border-bottom:2px solid #cbd5e1">Name</th>
          <th style="padding:8px;border-bottom:2px solid #cbd5e1">Vendor</th>
          <th style="padding:8px;border-bottom:2px solid #cbd5e1">Renewal</th>
          <th style="padding:8px;border-bottom:2px solid #cbd5e1">Status</th>
        </tr>
      </thead>
      <tbody>${subRows || `<tr><td colspan="4" style="padding:12px">None</td></tr>`}</tbody>
    </table>
    <h3 style="margin:24px 0 8px;font-size:15px">Firewalls (${fws.length})</h3>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#f1f5f9;text-align:left">
          <th style="padding:8px;border-bottom:2px solid #cbd5e1">Location</th>
          <th style="padding:8px;border-bottom:2px solid #cbd5e1">Serial</th>
          <th style="padding:8px;border-bottom:2px solid #cbd5e1">Expiry</th>
          <th style="padding:8px;border-bottom:2px solid #cbd5e1">Status</th>
        </tr>
      </thead>
      <tbody>${fwRows || `<tr><td colspan="4" style="padding:12px">None</td></tr>`}</tbody>
    </table>
    <p style="margin-top:24px;font-size:12px;color:#64748b">Sent at ${now.toISOString()}</p>
  </div>`;

  const fromAddr = settings.smtpUser?.trim() || `noreply@${settings.smtpHost}`;

  await transport.sendMail({
    from: fromAddr,
    to: recipients.join(", "),
    subject,
    html,
  });

  await PlatformSettings.updateOne(
    {},
    { $set: { lastExpiryDigestAt: now } },
    { upsert: true },
  );

  return {
    ok: true,
    sent: true,
    message: `Email sent to ${recipients.length} recipient(s).`,
    subscriptions: subs.length,
    firewalls: fws.length,
  };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
