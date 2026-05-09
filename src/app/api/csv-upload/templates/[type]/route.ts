import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/apiAuth";

type Params = { params: Promise<{ type: string }> };

const templates: Record<string, string> = {
  subscriptions:
    "name,vendorId,category,licenseType,licenseCount,startDate,endDate,renewalDate,cost,currency,paymentFrequency,autoRenewEnabled,assignedDepartment,status,notes",
  vendors:
    "name,companyName,contactPerson,mobileNumber,trnNumber,location,email,phone,website,address,servicesProvided,contractStartDate,contractEndDate,status,notes",
  servers:
    "serverName,ipAddress,hostname,siemEnabled,indefent,dlpEnabled,pam,serverType,iloIp,veeamStatus,lastSystemCheckDate,operatingSystem,environment,location,provider,cpu,ram,storage,ownerTeam,purpose,warrantyExpiry,status,notes",
  firewalls:
    "county,branch,wanIp,lanIp,serialNumber,expiryDate,firmwareVersion,vendor,backup,lastCheckedDate",
  "avaya-telephones": "county,branchName,lanIp,extNumber",
};

export async function GET(_: Request, { params }: Params) {
  const auth = await requireApiAuth();
  if (auth.error) return auth.error;

  const { type } = await params;
  const template = templates[type];
  if (!template) {
    return NextResponse.json({ message: "Template not found" }, { status: 404 });
  }

  return new Response(`${template}\n`, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${type}-template.csv"`,
    },
  });
}
