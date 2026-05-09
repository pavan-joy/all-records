import { Model, Schema, models, model } from "mongoose";

export interface IPlatformSettings {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  alertsEnabled: boolean;
  alertRecipients: string[];
  subscriptionAlertDays: number;
  firewallAlertDays: number;
  lastExpiryDigestAt?: Date;
  updatedAt: Date;
}

const platformSettingsSchema = new Schema<IPlatformSettings>(
  {
    smtpHost: { type: String, default: "", trim: true },
    smtpPort: { type: Number, default: 587 },
    smtpSecure: { type: Boolean, default: false },
    smtpUser: { type: String, default: "", trim: true },
    smtpPassword: { type: String, default: "", select: false },
    alertsEnabled: { type: Boolean, default: false },
    alertRecipients: { type: [String], default: [] },
    subscriptionAlertDays: { type: Number, default: 30, min: 1, max: 365 },
    firewallAlertDays: { type: Number, default: 30, min: 1, max: 365 },
    lastExpiryDigestAt: { type: Date },
  },
  { timestamps: true, collection: "platformsettings" },
);

const PlatformSettings =
  (models.PlatformSettings as Model<IPlatformSettings>) ||
  model<IPlatformSettings>("PlatformSettings", platformSettingsSchema);

export default PlatformSettings;
