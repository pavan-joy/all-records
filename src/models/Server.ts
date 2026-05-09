import { Model, Schema, Types, models, model } from "mongoose";

export interface IServer {
  serverName: string;
  ipAddress?: string;
  hostname?: string;
  siemEnabled?: boolean;
  indefent?: boolean;
  dlpEnabled?: boolean;
  serverType?: "Physical" | "Virtual" | "Cloud";
  iloIp?: string;
  veeamStatus?: "Enabled" | "Disabled" | "Not Required";
  pam?: "Yes" | "No" | "Not Required";
  lastSystemCheckDate?: Date;
  operatingSystem?: string;
  environment: "Production" | "Testing" | "Development";
  location?: string;
  provider?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  ownerTeam?: string;
  purpose?: string;
  warrantyExpiry?: Date;
  status: "Active" | "Inactive" | "Retired";
  notes?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const serverSchema = new Schema<IServer>(
  {
    serverName: { type: String, required: true, trim: true, unique: true },
    ipAddress: { type: String, trim: true },
    hostname: { type: String, trim: true },
    siemEnabled: { type: Boolean, default: false },
    indefent: { type: Boolean, default: false },
    dlpEnabled: { type: Boolean, default: false },
    serverType: { type: String, enum: ["Physical", "Virtual", "Cloud"], default: "Physical" },
    iloIp: { type: String, trim: true },
    veeamStatus: {
      type: String,
      enum: ["Enabled", "Disabled", "Not Required"],
      default: "Not Required",
    },
    pam: {
      type: String,
      enum: ["Yes", "No", "Not Required"],
      default: "Not Required",
    },
    lastSystemCheckDate: Date,
    operatingSystem: { type: String, trim: true },
    environment: { type: String, enum: ["Production", "Testing", "Development"], default: "Production" },
    location: { type: String, trim: true },
    provider: { type: String, trim: true },
    cpu: { type: String, trim: true },
    ram: { type: String, trim: true },
    storage: { type: String, trim: true },
    ownerTeam: { type: String, trim: true },
    purpose: { type: String, trim: true },
    warrantyExpiry: Date,
    status: { type: String, enum: ["Active", "Inactive", "Retired"], default: "Active", required: true },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true, collection: "servers" },
);

const Server = (models.Server as Model<IServer>) || model<IServer>("Server", serverSchema);

export default Server;
