import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth, requireWriteAccess } from "@/lib/apiAuth";
import { avayaTelephoneSchema } from "@/lib/validations";
import AvayaTelephone from "@/models/AvayaTelephone";

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";

  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { county: { $regex: search, $options: "i" } },
      { branchName: { $regex: search, $options: "i" } },
      { lanIp: { $regex: search, $options: "i" } },
      { extNumber: { $regex: search, $options: "i" } },
    ];
  }

  const rows = await AvayaTelephone.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ data: rows });
}

export async function POST(request: Request) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = avayaTelephoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const row = await AvayaTelephone.create({
    ...parsed.data,
    createdBy: auth.session?.user.id,
    updatedBy: auth.session?.user.id,
  });
  return NextResponse.json({ data: row }, { status: 201 });
}
