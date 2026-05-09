import { NextResponse } from "next/server";
import { runExpiryAlertJob } from "@/lib/expiryAlerts";

/**
 * Scheduled expiry digest (e.g. Vercel Cron). Set CRON_SECRET and call with:
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "CRON_SECRET is not configured." }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const force =
    request.headers.get("x-force-digest") === "1" || process.env.CRON_FORCE_DIGEST === "1";

  const result = await runExpiryAlertJob({ force });
  return NextResponse.json({ data: result });
}
