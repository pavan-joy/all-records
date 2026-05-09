import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth, requireWriteAccess } from "@/lib/apiAuth";
import { vendorSchema } from "@/lib/validations";
import Vendor from "@/models/Vendor";

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status");
  const sort = searchParams.get("sort") ?? "-createdAt";

  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }
  if (status) query.status = status;

  const vendors = await Vendor.find(query).sort(sort).lean();
  return NextResponse.json({ data: vendors });
}

export async function POST(request: Request) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = vendorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const vendor = await Vendor.create({
    ...parsed.data,
    createdBy: auth.session?.user.id,
    updatedBy: auth.session?.user.id,
  });
  return NextResponse.json({ data: vendor }, { status: 201 });
}
