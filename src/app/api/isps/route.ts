import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth, requireWriteAccess } from "@/lib/apiAuth";
import { ispSchema } from "@/lib/validations";
import Isp from "@/models/Isp";

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";

  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { shopName: { $regex: search, $options: "i" } },
      { accountNumber: { $regex: search, $options: "i" } },
      { serviceProviderName: { $regex: search, $options: "i" } },
      { region: { $regex: search, $options: "i" } },
      { telephoneNumber: { $regex: search, $options: "i" } },
    ];
  }

  const rows = await Isp.find(query).sort({ shopName: 1 }).lean();
  return NextResponse.json({ data: rows });
}

export async function POST(request: Request) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = ispSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const doc = await Isp.create({
    ...parsed.data,
    createdBy: auth.session?.user.id,
    updatedBy: auth.session?.user.id,
  });
  return NextResponse.json({ data: doc }, { status: 201 });
}
