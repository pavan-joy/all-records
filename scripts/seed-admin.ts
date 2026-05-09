import { hash } from "bcryptjs";
import { config } from "dotenv";
import mongoose from "mongoose";

config();

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/it_subscription_management";

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: "it_subscription_management" });

  const adminUserSchema = new mongoose.Schema(
    {
      name: String,
      email: { type: String, unique: true },
      passwordHash: String,
      role: String,
      status: String,
    },
    { timestamps: true, collection: "adminusers" },
  );

  const AdminUser = mongoose.models.AdminUserSeed || mongoose.model("AdminUserSeed", adminUserSchema);

  const existing = await AdminUser.findOne({ email: "admin@example.com" });
  if (existing) {
    console.log("Seed admin already exists.");
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await hash("Admin@12345", 12);
  await AdminUser.create({
    name: "Super Admin",
    email: "admin@example.com",
    passwordHash,
    role: "SUPER_ADMIN",
    status: "Active",
  });

  console.log("Default SUPER_ADMIN created: admin@example.com");
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Failed to seed admin:", error);
  process.exit(1);
});
