import { Model, Schema, Types, models, model } from "mongoose";

export interface IVendor {
  name: string;
  companyName?: string;
  contactPerson?: string;
  mobileNumber?: string;
  trnNumber?: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  servicesProvided?: string;
  contractStartDate?: Date;
  contractEndDate?: Date;
  status: "Active" | "Inactive";
  notes?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    companyName: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    mobileNumber: { type: String, trim: true },
    trnNumber: { type: String, trim: true },
    location: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    address: { type: String, trim: true },
    servicesProvided: { type: String, trim: true },
    contractStartDate: Date,
    contractEndDate: Date,
    status: { type: String, enum: ["Active", "Inactive"], default: "Active", required: true },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true, collection: "vendors" },
);

const Vendor = (models.Vendor as Model<IVendor>) || model<IVendor>("Vendor", vendorSchema);

export default Vendor;
