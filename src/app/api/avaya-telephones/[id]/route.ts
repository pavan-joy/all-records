import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth, requireWriteAccess } from "@/lib/apiAuth";
import { avayaTelephoneSchema } from "@/lib/validations";
import AvayaTelephone from "@/models/AvayaTelephone";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { id } = await params;
  const row = await AvayaTelephone.findById(id).lean();
  if (!row) return NextResponse.json({ message: "Record not found" }, { status: 404 });
  return NextResponse.json({ data: row });
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = avayaTelephoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const { id } = await params;
  const row = await AvayaTelephone.findByIdAndUpdate(
    id,
    { ...parsed.data, updatedBy: auth.session?.user.id },
    { new: true, runValidators: true },
  );
  if (!row) return NextResponse.json({ message: "Record not found" }, { status: 404 });
  return NextResponse.json({ data: row });
}

export async function DELETE(_: Request, { params }: Params) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { id } = await params;
  const row = await AvayaTelephone.findByIdAndDelete(id);
  if (!row) return NextResponse.json({ message: "Record not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
