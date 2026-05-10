import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);
const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());
const optionalNumber = z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional());

export const adminUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "READ_ONLY"]),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

/** Super-admin password reset for another admin user */
export const adminPasswordResetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const totpCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator app"),
});

export const disableTwoFactorSchema = z.object({
  password: z.string().min(1, "Password is required"),
  totp: z.string().optional(),
});

export const vendorSchema = z.object({
  name: z.string().min(2),
  companyName: z.string().optional(),
  contactPerson: z.string().optional(),
  mobileNumber: z.string().optional(),
  trnNumber: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  servicesProvided: z.string().optional(),
  contractStartDate: z.coerce.date().optional(),
  contractEndDate: z.coerce.date().optional(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  notes: z.string().optional(),
});

export const subscriptionSchema = z.object({
  name: z.string().min(2),
  vendorId: z.string().min(1),
  category: z.string().optional(),
  licenseType: z.string().optional(),
  licenseCount: z.coerce.number().int().min(0).optional(),
  startDate: optionalDate,
  endDate: optionalDate,
  renewalDate: optionalDate,
  cost: optionalNumber,
  currency: z.string().optional(),
  paymentFrequency: z.preprocess(emptyToUndefined, z.enum(["Monthly", "Yearly", "Weekly"]).optional()),
  autoRenewEnabled: z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) return undefined;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "yes", "y", "1"].includes(normalized)) return true;
      if (["false", "no", "n", "0"].includes(normalized)) return false;
    }
    return value;
  }, z.boolean().optional()),
  assignedDepartment: z.string().optional(),
  status: z.enum(["Active", "Expired", "Cancelled", "Pending Renewal"]).default("Active"),
  notes: z.string().optional(),
});

const yesNoBoolean = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const n = value.trim().toLowerCase();
    if (["true", "yes", "y", "1"].includes(n)) return true;
    if (["false", "no", "n", "0"].includes(n)) return false;
  }
  return value;
}, z.boolean().optional());

const veeamStatusField = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) return "Not Required";
  const s = String(value).trim().toLowerCase();
  if (s === "enabled") return "Enabled";
  if (s === "disabled") return "Disabled";
  if (s === "not required" || s === "notrequired" || s === "n/a") return "Not Required";
  return value;
}, z.enum(["Enabled", "Disabled", "Not Required"]));

const pamTriStateField = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) return "Not Required";
  const s = String(value).trim().toLowerCase();
  if (["yes", "y", "true", "1"].includes(s)) return "Yes";
  if (["no", "n", "false", "0"].includes(s)) return "No";
  if (["not required", "na", "n/a", "notrequired"].includes(s)) return "Not Required";
  return value;
}, z.enum(["Yes", "No", "Not Required"]));

export const serverSchema = z.object({
  serverName: z.string().min(2),
  ipAddress: z.string().optional(),
  hostname: z.string().optional(),
  siemEnabled: yesNoBoolean,
  indefent: yesNoBoolean,
  dlpEnabled: yesNoBoolean,
  serverType: z.enum(["Physical", "Virtual", "Cloud"]).default("Physical"),
  iloIp: z.string().optional(),
  pam: pamTriStateField,
  veeamStatus: veeamStatusField,
  lastSystemCheckDate: optionalDate,
  operatingSystem: z.string().optional(),
  environment: z.enum(["Production", "Testing", "Development"]).default("Production"),
  location: z.string().optional(),
  provider: z.string().optional(),
  cpu: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  ownerTeam: z.string().optional(),
  purpose: z.string().optional(),
  warrantyExpiry: z.coerce.date().optional(),
  status: z.enum(["Active", "Inactive", "Retired"]).default("Active"),
  notes: z.string().optional(),
});

const firewallBackupField = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) return "Not Required";
  const s = String(value).trim().toLowerCase();
  if (["yes", "y", "true", "1"].includes(s)) return "Yes";
  if (["no", "n", "false", "0"].includes(s)) return "No";
  if (["not required", "na", "n/a"].includes(s)) return "Not Required";
  return value;
}, z.enum(["Yes", "No", "Not Required"]));

export const firewallSchema = z.object({
  county: z.string().min(1),
  branch: z.string().min(1),
  wanIp: z.string().optional(),
  lanIp: z.string().optional(),
  serialNumber: z.string().optional(),
  expiryDate: optionalDate,
  firmwareVersion: z.string().optional(),
  vendor: z.string().optional(),
  backup: firewallBackupField,
  lastCheckedDate: optionalDate,
});

export const avayaTelephoneSchema = z.object({
  county: z.string().min(1),
  branchName: z.string().min(1),
  lanIp: z.string().optional(),
  extNumber: z.string().optional(),
});

export const ispSchema = z.object({
  shopName: z.string().min(1),
  fiveGBackupEnabled: z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) return false;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const n = value.trim().toLowerCase();
      if (["true", "yes", "y", "1", "en", "on"].includes(n)) return true;
      if (["false", "no", "n", "0", "off"].includes(n)) return false;
    }
    return value;
  }, z.boolean()),
  accountNumber: z.string().optional(),
  serviceProviderName: z.string().optional(),
  region: z.string().optional(),
  telephoneNumber: z.string().optional(),
});

export type CsvEntityType = "subscription" | "vendor" | "server" | "firewall" | "avayaTelephone";
