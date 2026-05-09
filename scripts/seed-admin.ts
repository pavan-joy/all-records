import { hash } from "bcryptjs";
import { config } from "dotenv";
import mongoose from "mongoose";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/it_subscription_management";

const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL?.trim();
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const SEED_ADMIN_NAME = process.env.SEED_ADMIN_NAME?.trim() || "Super Admin";

async function run() {
  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    console.error("Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD. Set them in .env.");
    process.exit(1);
  }

  if (SEED_ADMIN_PASSWORD.length < 8) {
    console.error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

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

  const existing = await AdminUser.findOne({ email: SEED_ADMIN_EMAIL });
  if (existing) {
    console.log("Seed admin already exists for this email.");
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await hash(SEED_ADMIN_PASSWORD, 12);
  await AdminUser.create({
    name: SEED_ADMIN_NAME,
    email: SEED_ADMIN_EMAIL,
    passwordHash,
    role: "SUPER_ADMIN",
    status: "Active",
  });

  console.log(`Default SUPER_ADMIN created: ${SEED_ADMIN_EMAIL}`);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Failed to seed admin:", error);
  process.exit(1);
});
