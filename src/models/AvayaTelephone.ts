import { Model, Schema, Types, models, model } from "mongoose";

export interface IAvayaTelephone {
  county: string;
  branchName: string;
  lanIp?: string;
  extNumber?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const avayaTelephoneSchema = new Schema<IAvayaTelephone>(
  {
    county: { type: String, required: true, trim: true },
    branchName: { type: String, required: true, trim: true },
    lanIp: { type: String, trim: true },
    extNumber: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true, collection: "avayatelephones" },
);

const AvayaTelephone =
  (models.AvayaTelephone as Model<IAvayaTelephone>) ||
  model<IAvayaTelephone>("AvayaTelephone", avayaTelephoneSchema);

export default AvayaTelephone;
