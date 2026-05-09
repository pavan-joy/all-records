import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getAuthSession } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
