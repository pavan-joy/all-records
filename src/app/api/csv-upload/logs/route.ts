import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/apiAuth";
import CsvImportLog from "@/models/CsvImportLog";

export async function GET() {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const logs = await CsvImportLog.find().sort({ createdAt: -1 }).limit(25).populate("uploadedBy", "name email").lean();
  return NextResponse.json({ data: logs });
}
