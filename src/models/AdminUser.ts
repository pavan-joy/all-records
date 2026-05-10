import { Model, Schema, models, model } from "mongoose";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "READ_ONLY";
export type AdminStatus = "Active" | "Inactive";

export interface IAdminUser {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  status: AdminStatus;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorPendingSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminUserSchema = new Schema<IAdminUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["SUPER_ADMIN", "ADMIN", "READ_ONLY"], default: "ADMIN", required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active", required: true },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    twoFactorPendingSecret: { type: String, select: false },
  },
  { timestamps: true, collection: "adminusers" },
);

const AdminUser = (models.AdminUser as Model<IAdminUser>) || model<IAdminUser>("AdminUser", adminUserSchema);

export default AdminUser;
