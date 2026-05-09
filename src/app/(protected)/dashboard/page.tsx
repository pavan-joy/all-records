import DashboardContent from "./DashboardContent";
import { getDashboardSummary } from "@/lib/dashboardSummary";

export default async function DashboardPage() {
  const initialSummary = await getDashboardSummary();
  return <DashboardContent initialSummary={initialSummary} />;
}
