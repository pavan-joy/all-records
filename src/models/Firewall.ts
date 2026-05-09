import { Model, Schema, Types, models, model } from "mongoose";

export interface IFirewall {
  county: string;
  branch: string;
  wanIp?: string;
  lanIp?: string;
  serialNumber?: string;
  expiryDate?: Date;
  firmwareVersion?: string;
  vendor?: string;
  backup?: "Yes" | "No" | "Not Required";
  lastCheckedDate?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const firewallSchema = new Schema<IFirewall>(
  {
    county: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    wanIp: { type: String, trim: true },
    lanIp: { type: String, trim: true },
    serialNumber: { type: String, trim: true },
    expiryDate: Date,
    firmwareVersion: { type: String, trim: true },
    vendor: { type: String, trim: true },
    backup: { type: String, enum: ["Yes", "No", "Not Required"], default: "Not Required" },
    lastCheckedDate: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true, collection: "firewalls" },
);

const Firewall = (models.Firewall as Model<IFirewall>) || model<IFirewall>("Firewall", firewallSchema);

export default Firewall;
