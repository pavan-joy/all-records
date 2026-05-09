import { Model, Schema, Types, models, model } from "mongoose";

export interface ISubscription {
  name: string;
  vendorId: Types.ObjectId;
  category?: string;
  licenseType?: string;
  licenseCount?: number;
  startDate?: Date;
  endDate?: Date;
  renewalDate?: Date;
  cost?: number;
  currency?: string;
  paymentFrequency?: "Monthly" | "Yearly" | "Weekly";
  autoRenewEnabled?: boolean;
  assignedDepartment?: string;
  status: "Active" | "Expired" | "Cancelled" | "Pending Renewal";
  notes?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    name: { type: String, required: true, trim: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    category: { type: String, trim: true },
    licenseType: { type: String, trim: true },
    licenseCount: Number,
    startDate: Date,
    endDate: Date,
    renewalDate: Date,
    cost: Number,
    currency: { type: String, trim: true, default: "USD" },
    paymentFrequency: { type: String, enum: ["Monthly", "Yearly", "Weekly"] },
    autoRenewEnabled: { type: Boolean, default: false },
    assignedDepartment: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Active", "Expired", "Cancelled", "Pending Renewal"],
      default: "Active",
      required: true,
    },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true, collection: "subscriptions" },
);

const Subscription =
  (models.Subscription as Model<ISubscription>) || model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;
