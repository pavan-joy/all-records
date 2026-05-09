import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth, requireWriteAccess } from "@/lib/apiAuth";
import { subscriptionSchema } from "@/lib/validations";
import Subscription from "@/models/Subscription";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { id } = await params;
  const subscription = await Subscription.findById(id).populate("vendorId", "name").lean();
  if (!subscription) return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
  return NextResponse.json({ data: subscription });
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = subscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const { id } = await params;
  const subscription = await Subscription.findByIdAndUpdate(
    id,
    { ...parsed.data, updatedBy: auth.session?.user.id },
    { new: true, runValidators: true },
  );
  if (!subscription) return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
  return NextResponse.json({ data: subscription });
}

export async function DELETE(_: Request, { params }: Params) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { id } = await params;
  const subscription = await Subscription.findByIdAndDelete(id);
  if (!subscription) return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
  return NextResponse.json({ message: "Subscription deleted" });
}
