import { connectToDatabase } from "@/lib/mongodb";
import Server from "@/models/Server";
import Subscription from "@/models/Subscription";
import Vendor from "@/models/Vendor";

export type DashboardSummary = {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiringSubscriptions: number;
  totalVendors: number;
  totalServers: number;
  activeServers: number;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await connectToDatabase();

  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(now.getDate() + 30);

  const [totalSubscriptions, activeSubscriptions, expiringSubscriptions, totalVendors, totalServers, activeServers] =
    await Promise.all([
      Subscription.countDocuments(),
      Subscription.countDocuments({ status: "Active" }),
      Subscription.countDocuments({ renewalDate: { $lte: in30Days, $gte: now }, status: "Active" }),
      Vendor.countDocuments(),
      Server.countDocuments(),
      Server.countDocuments({ status: "Active" }),
    ]);

  return {
    totalSubscriptions,
    activeSubscriptions,
    expiringSubscriptions,
    totalVendors,
    totalServers,
    activeServers,
  };
}
