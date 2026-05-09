import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth, requireWriteAccess } from "@/lib/apiAuth";
import { serverSchema } from "@/lib/validations";
import Server from "@/models/Server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { id } = await params;
  const server = await Server.findById(id).lean();
  if (!server) return NextResponse.json({ message: "Server not found" }, { status: 404 });
  return NextResponse.json({ data: server });
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = serverSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const { id } = await params;
  const server = await Server.findByIdAndUpdate(
    id,
    { ...parsed.data, updatedBy: auth.session?.user.id },
    { new: true, runValidators: true },
  );
  if (!server) return NextResponse.json({ message: "Server not found" }, { status: 404 });
  return NextResponse.json({ data: server });
}

export async function DELETE(_: Request, { params }: Params) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { id } = await params;
  const server = await Server.findByIdAndDelete(id);
  if (!server) return NextResponse.json({ message: "Server not found" }, { status: 404 });
  return NextResponse.json({ message: "Server deleted" });
}
