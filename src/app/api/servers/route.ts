import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth, requireWriteAccess } from "@/lib/apiAuth";
import { serverSchema } from "@/lib/validations";
import Server from "@/models/Server";

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status");
  const environment = searchParams.get("environment");

  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { serverName: { $regex: search, $options: "i" } },
      { hostname: { $regex: search, $options: "i" } },
      { ipAddress: { $regex: search, $options: "i" } },
      { iloIp: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }
  if (status) query.status = status;
  if (environment) query.environment = environment;

  const servers = await Server.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ data: servers });
}

export async function POST(request: Request) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = serverSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation error", errors: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const server = await Server.create({
    ...parsed.data,
    createdBy: auth.session?.user.id,
    updatedBy: auth.session?.user.id,
  });
  return NextResponse.json({ data: server }, { status: 201 });
}
