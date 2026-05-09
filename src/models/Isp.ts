import { Model, Schema, Types, models, model } from "mongoose";

export interface IIsp {
  shopName: string;
  fiveGBackupEnabled: boolean;
  accountNumber?: string;
  serviceProviderName?: string;
  region?: string;
  telephoneNumber?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ispSchema = new Schema<IIsp>(
  {
    shopName: { type: String, required: true, trim: true },
    fiveGBackupEnabled: { type: Boolean, default: false },
    accountNumber: { type: String, trim: true },
    serviceProviderName: { type: String, trim: true },
    region: { type: String, trim: true },
    telephoneNumber: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true, collection: "isps" },
);

const Isp = (models.Isp as Model<IIsp>) || model<IIsp>("Isp", ispSchema);

export default Isp;
