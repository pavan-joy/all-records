import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/apiAuth";
import AvayaTelephone from "@/models/AvayaTelephone";
import Firewall from "@/models/Firewall";
import Server from "@/models/Server";
import Subscription from "@/models/Subscription";
import Vendor from "@/models/Vendor";
import Isp from "@/models/Isp";
import { makeCsvResponse } from "@/utils/exportCsv";

type Params = { params: Promise<{ type: string }> };

export async function GET(_: Request, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;
  await connectToDatabase();

  const { type } = await params;

  if (type === "subscriptions") {
    const rows = await Subscription.find().populate("vendorId", "name").lean();
    return makeCsvResponse(
      "subscriptions.csv",
      rows.map((row) => ({
        name: row.name,
        vendorId:
          ((row.vendorId as unknown as { _id?: string; name?: string })?.name ??
            String(row.vendorId || "")),
        category: row.category,
        licenseType: row.licenseType,
        licenseCount: row.licenseCount,
        startDate: row.startDate,
        endDate: row.endDate,
        renewalDate: row.renewalDate,
        cost: row.cost,
        currency: row.currency,
        paymentFrequency: row.paymentFrequency,
        autoRenewEnabled: row.autoRenewEnabled,
        assignedDepartment: row.assignedDepartment,
        status: row.status,
        notes: row.notes,
      })),
    );
  }

  if (type === "vendors") {
    const rows = await Vendor.find().lean();
    return makeCsvResponse(
      "vendors.csv",
      rows.map((row) => ({
        name: row.name,
        companyName: row.companyName,
        contactPerson: row.contactPerson,
        mobileNumber: row.mobileNumber,
        trnNumber: row.trnNumber,
        location: row.location,
        email: row.email,
        phone: row.phone,
        website: row.website,
        address: row.address,
        servicesProvided: row.servicesProvided,
        contractStartDate: row.contractStartDate,
        contractEndDate: row.contractEndDate,
        status: row.status,
        notes: row.notes,
      })),
    );
  }

  if (type === "servers") {
    const rows = await Server.find().lean();
    return makeCsvResponse(
      "servers.csv",
      rows.map((row) => ({
        serverName: row.serverName,
        ipAddress: row.ipAddress,
        hostname: row.hostname,
        siemEnabled: row.siemEnabled,
        indefent: row.indefent,
        dlpEnabled: row.dlpEnabled,
        pam: row.pam,
        serverType: row.serverType,
        iloIp: row.iloIp,
        veeamStatus: row.veeamStatus,
        lastSystemCheckDate: row.lastSystemCheckDate,
        operatingSystem: row.operatingSystem,
        environment: row.environment,
        location: row.location,
        provider: row.provider,
        cpu: row.cpu,
        ram: row.ram,
        storage: row.storage,
        ownerTeam: row.ownerTeam,
        purpose: row.purpose,
        warrantyExpiry: row.warrantyExpiry,
        status: row.status,
        notes: row.notes,
      })),
    );
  }

  if (type === "firewalls") {
    const rows = await Firewall.find().lean();
    return makeCsvResponse(
      "firewalls.csv",
      rows.map((row) => ({
        county: row.county,
        branch: row.branch,
        wanIp: row.wanIp,
        lanIp: row.lanIp,
        serialNumber: row.serialNumber,
        expiryDate: row.expiryDate,
        firmwareVersion: row.firmwareVersion,
        vendor: row.vendor,
        backup: row.backup,
        lastCheckedDate: row.lastCheckedDate,
      })),
    );
  }

  if (type === "avaya-telephones") {
    const rows = await AvayaTelephone.find().lean();
    return makeCsvResponse(
      "avaya-telephones.csv",
      rows.map((row) => ({
        county: row.county,
        branchName: row.branchName,
        lanIp: row.lanIp,
        extNumber: row.extNumber,
      })),
    );
  }

  if (type === "isp") {
    const rows = await Isp.find().lean();
    return makeCsvResponse(
      "isp.csv",
      rows.map((row) => ({
        shopName: row.shopName,
        fiveGBackupEnabled: row.fiveGBackupEnabled,
        accountNumber: row.accountNumber,
        serviceProviderName: row.serviceProviderName,
        region: row.region,
        telephoneNumber: row.telephoneNumber,
      })),
    );
  }

  return NextResponse.json({ message: "Unsupported export type" }, { status: 400 });
}
