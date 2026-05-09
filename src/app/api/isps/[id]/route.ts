import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth, requireWriteAccess } from "@/lib/apiAuth";
import { ispSchema } from "@/lib/validations";
import Isp from "@/models/Isp";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { id } = await params;
  const doc = await Isp.findById(id).lean();
  if (!doc) return NextResponse.json({ message: "ISP record not found" }, { status: 404 });
  return NextResponse.json({ data: doc });
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = ispSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const { id } = await params;
  const doc = await Isp.findByIdAndUpdate(
    id,
    { ...parsed.data, updatedBy: auth.session?.user.id },
    { new: true, runValidators: true },
  );
  if (!doc) return NextResponse.json({ message: "ISP record not found" }, { status: 404 });
  return NextResponse.json({ data: doc });
}

export async function DELETE(_: Request, { params }: Params) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { id } = await params;
  const doc = await Isp.findByIdAndDelete(id);
  if (!doc) return NextResponse.json({ message: "ISP record not found" }, { status: 404 });
  return NextResponse.json({ message: "ISP record deleted" });
}
