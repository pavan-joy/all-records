import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth, requireWriteAccess } from "@/lib/apiAuth";
import { firewallSchema } from "@/lib/validations";
import Firewall from "@/models/Firewall";

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
      { branch: { $regex: search, $options: "i" } },
      { wanIp: { $regex: search, $options: "i" } },
      { lanIp: { $regex: search, $options: "i" } },
      { serialNumber: { $regex: search, $options: "i" } },
      { vendor: { $regex: search, $options: "i" } },
    ];
  }

  const firewalls = await Firewall.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ data: firewalls });
}

export async function POST(request: Request) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = firewallSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const firewall = await Firewall.create({
    ...parsed.data,
    createdBy: auth.session?.user.id,
    updatedBy: auth.session?.user.id,
  });
  return NextResponse.json({ data: firewall }, { status: 201 });
}
