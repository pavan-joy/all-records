import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/apiAuth";
import { runExpiryAlertJob } from "@/lib/expiryAlerts";

const bodySchema = z.object({
  force: z.boolean().optional(),
});

export async function POST(request: Request) {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.error;

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
  }

  const force = parsed.data.force ?? true;
  const result = await runExpiryAlertJob({ force });
  return NextResponse.json({ data: result });
}
