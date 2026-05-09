import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireWriteAccess } from "@/lib/apiAuth";
import {
  avayaTelephoneSchema,
  firewallSchema,
  serverSchema,
  subscriptionSchema,
  vendorSchema,
} from "@/lib/validations";
import AvayaTelephone from "@/models/AvayaTelephone";
import CsvImportLog from "@/models/CsvImportLog";
import Firewall from "@/models/Firewall";
import Server from "@/models/Server";
import Subscription from "@/models/Subscription";
import Vendor from "@/models/Vendor";

type Params = { params: Promise<{ type: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireWriteAccess();
  if (auth.error) return auth.error;
  await connectToDatabase();

  const { type } = await params;
  const body = await request.json();
  const rows = Array.isArray(body.rows) ? body.rows : [];
  const fileName = String(body.fileName || "upload.csv");

  let successRows = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    try {
      if (type === "subscriptions") {
        const parsed = subscriptionSchema.safeParse(row);
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid row");
        await Subscription.findOneAndUpdate(
          { name: parsed.data.name, vendorId: parsed.data.vendorId },
          { ...parsed.data, updatedBy: auth.session?.user.id, createdBy: auth.session?.user.id },
          { upsert: true, new: true, runValidators: true },
        );
      } else if (type === "vendors") {
        const parsed = vendorSchema.safeParse(row);
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid row");
        await Vendor.findOneAndUpdate(
          { name: parsed.data.name },
          { ...parsed.data, updatedBy: auth.session?.user.id, createdBy: auth.session?.user.id },
          { upsert: true, new: true, runValidators: true },
        );
      } else if (type === "servers") {
        const parsed = serverSchema.safeParse(row);
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid row");
        await Server.findOneAndUpdate(
          { serverName: parsed.data.serverName },
          { ...parsed.data, updatedBy: auth.session?.user.id, createdBy: auth.session?.user.id },
          { upsert: true, new: true, runValidators: true },
        );
      } else if (type === "firewalls") {
        const parsed = firewallSchema.safeParse(row);
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid row");
        const serial = parsed.data.serialNumber?.trim();
        const filter = serial
          ? { county: parsed.data.county, branch: parsed.data.branch, serialNumber: serial }
          : {
              county: parsed.data.county,
              branch: parsed.data.branch,
              wanIp: parsed.data.wanIp ?? "",
              lanIp: parsed.data.lanIp ?? "",
            };
        await Firewall.findOneAndUpdate(
          filter,
          { ...parsed.data, updatedBy: auth.session?.user.id, createdBy: auth.session?.user.id },
          { upsert: true, new: true, runValidators: true },
        );
      } else if (type === "avaya-telephones") {
        const parsed = avayaTelephoneSchema.safeParse(row);
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid row");
        const ext = parsed.data.extNumber?.trim();
        const filter = ext
          ? { county: parsed.data.county, branchName: parsed.data.branchName, extNumber: ext }
          : {
              county: parsed.data.county,
              branchName: parsed.data.branchName,
              lanIp: parsed.data.lanIp ?? "",
            };
        await AvayaTelephone.findOneAndUpdate(
          filter,
          { ...parsed.data, updatedBy: auth.session?.user.id, createdBy: auth.session?.user.id },
          { upsert: true, new: true, runValidators: true },
        );
      } else {
        return NextResponse.json({ message: "Unsupported CSV type" }, { status: 400 });
      }

      successRows += 1;
    } catch (error) {
      errors.push(`Row ${i + 1}: ${(error as Error).message}`);
    }
  }

  const failedRows = rows.length - successRows;
  await CsvImportLog.create({
    type:
      type === "subscriptions"
        ? "SUBSCRIPTION"
        : type === "vendors"
          ? "VENDOR"
          : type === "servers"
            ? "SERVER"
            : type === "firewalls"
              ? "FIREWALL"
              : type === "avaya-telephones"
                ? "AVAYA_TELEPHONE"
                : "VENDOR",
    fileName,
    uploadedBy: auth.session?.user.id,
    totalRows: rows.length,
    successRows,
    failedRows,
    errors,
  });

  return NextResponse.json({ data: { totalRows: rows.length, successRows, failedRows, errors } });
}
