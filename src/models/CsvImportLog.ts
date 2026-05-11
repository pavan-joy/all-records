import { Model, Schema, Types, models, model } from "mongoose";

export interface ICsvImportLog {
  type: "SUBSCRIPTION" | "VENDOR" | "SERVER" | "FIREWALL" | "AVAYA_TELEPHONE" | "ISP";
  fileName: string;
  uploadedBy: Types.ObjectId;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: string[];
  createdAt: Date;
  updatedAt: Date;
}

const csvImportLogSchema = new Schema<ICsvImportLog>(
  {
    type: {
      type: String,
      enum: ["SUBSCRIPTION", "VENDOR", "SERVER", "FIREWALL", "AVAYA_TELEPHONE", "ISP"],
      required: true,
    },
    fileName: { type: String, required: true, trim: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true },
    totalRows: { type: Number, required: true },
    successRows: { type: Number, required: true },
    failedRows: { type: Number, required: true },
    errors: [{ type: String }],
  },
  { timestamps: true, collection: "csvimportlogs", suppressReservedKeysWarning: true },
);

const CsvImportLog =
  (models.CsvImportLog as Model<ICsvImportLog>) || model<ICsvImportLog>("CsvImportLog", csvImportLogSchema);

export default CsvImportLog;
