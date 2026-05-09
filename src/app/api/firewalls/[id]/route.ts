import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth, requireWriteAccess } from "@/lib/apiAuth";
import { firewallSchema } from "@/lib/validations";
import Firewall from "@/models/Firewall";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { id } = await params;
  const firewall = await Firewall.findById(id).lean();
  if (!firewall) return NextResponse.json({ message: "Firewall not found" }, { status: 404 });
  return NextResponse.json({ data: firewall });
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = firewallSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const { id } = await params;
  const firewall = await Firewall.findByIdAndUpdate(
    id,
    { ...parsed.data, updatedBy: auth.session?.user.id },
    { new: true, runValidators: true },
  );
  if (!firewall) return NextResponse.json({ message: "Firewall not found" }, { status: 404 });
  return NextResponse.json({ data: firewall });
}

export async function DELETE(_: Request, { params }: Params) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { id } = await params;
  const firewall = await Firewall.findByIdAndDelete(id);
  if (!firewall) return NextResponse.json({ message: "Firewall not found" }, { status: 404 });
  return NextResponse.json({ message: "Firewall deleted" });
}
