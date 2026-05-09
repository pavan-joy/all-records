import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth, requireWriteAccess } from "@/lib/apiAuth";
import { vendorSchema } from "@/lib/validations";
import Vendor from "@/models/Vendor";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { id } = await params;
  const vendor = await Vendor.findById(id).lean();
  if (!vendor) return NextResponse.json({ message: "Vendor not found" }, { status: 404 });
  return NextResponse.json({ data: vendor });
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = vendorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const { id } = await params;
  const vendor = await Vendor.findByIdAndUpdate(
    id,
    { ...parsed.data, updatedBy: auth.session?.user.id },
    { new: true, runValidators: true },
  );
  if (!vendor) return NextResponse.json({ message: "Vendor not found" }, { status: 404 });
  return NextResponse.json({ data: vendor });
}

export async function DELETE(_: Request, { params }: Params) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { id } = await params;
  const vendor = await Vendor.findByIdAndDelete(id);
  if (!vendor) return NextResponse.json({ message: "Vendor not found" }, { status: 404 });
  return NextResponse.json({ message: "Vendor deleted" });
}
