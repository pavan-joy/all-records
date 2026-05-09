import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/apiAuth";
import { getDashboardSummary } from "@/lib/dashboardSummary";

export async function GET() {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const data = await getDashboardSummary();
  return NextResponse.json({ data });
}
