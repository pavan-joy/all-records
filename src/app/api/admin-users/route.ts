import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth, requireSuperAdmin } from "@/lib/apiAuth";
import { adminUserSchema } from "@/lib/validations";
import AdminUser from "@/models/AdminUser";

export async function GET() {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const users = await AdminUser.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ data: users });
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = adminUserSchema.safeParse(body);
  if (!parsed.success || !parsed.data.password) {
    return NextResponse.json({ message: "Validation error", errors: parsed.success ? null : parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const existing = await AdminUser.findOne({ email: parsed.data.email.toLowerCase() });
  if (existing) return NextResponse.json({ message: "User already exists" }, { status: 409 });

  const passwordHash = await hash(parsed.data.password, 12);
  const user = await AdminUser.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    passwordHash,
    role: parsed.data.role,
    status: parsed.data.status,
  });

  return NextResponse.json(
    {
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    },
    { status: 201 },
  );
}
