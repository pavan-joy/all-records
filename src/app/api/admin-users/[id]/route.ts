import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireSuperAdmin } from "@/lib/apiAuth";
import { adminPasswordResetSchema } from "@/lib/validations";
import AdminUser from "@/models/AdminUser";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = adminPasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const { id } = await params;
  const passwordHash = await hash(parsed.data.password, 12);

  const user = await AdminUser.findByIdAndUpdate(id, { passwordHash }, { new: true, runValidators: true }).select(
    "-passwordHash",
  );

  if (!user) return NextResponse.json({ message: "Admin user not found" }, { status: 404 });
  return NextResponse.json({
    data: { _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status },
  });
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.error;

  await connectToDatabase();
  const body = await request.json();
  const { id } = await params;

  const updateData: Record<string, unknown> = {
    name: body.name,
    role: body.role,
    status: body.status,
  };

  if (body.password) {
    updateData.passwordHash = await hash(body.password, 12);
  }

  const user = await AdminUser.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select(
    "-passwordHash",
  );

  if (!user) return NextResponse.json({ message: "Admin user not found" }, { status: 404 });
  return NextResponse.json({ data: user });
}

export async function DELETE(_: Request, { params }: Params) {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;
  if (id === auth.session?.user.id) {
    return NextResponse.json({ message: "You cannot delete your own account." }, { status: 400 });
  }

  await connectToDatabase();
  const user = await AdminUser.findByIdAndDelete(id);
  if (!user) return NextResponse.json({ message: "Admin user not found" }, { status: 404 });
  return NextResponse.json({ message: "Admin user deleted" });
}
