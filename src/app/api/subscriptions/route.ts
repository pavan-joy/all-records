import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth, requireWriteAccess } from "@/lib/apiAuth";
import { subscriptionSchema } from "@/lib/validations";
import Subscription from "@/models/Subscription";

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status");

  const query: Record<string, unknown> = {};
  if (search) query.name = { $regex: search, $options: "i" };
  if (status) query.status = status;

  const subscriptions = await Subscription.find(query)
    .populate("vendorId", "name")
    .sort({ renewalDate: 1 })
    .lean();

  return NextResponse.json({ data: subscriptions });
}

export async function POST(request: Request) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = subscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const subscription = await Subscription.create({
    ...parsed.data,
    createdBy: auth.session?.user.id,
    updatedBy: auth.session?.user.id,
  });
  return NextResponse.json({ data: subscription }, { status: 201 });
}
