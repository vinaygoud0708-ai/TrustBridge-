import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { 
  LayoutDashboard,
  ShieldCheck,
  Megaphone,
  ArrowDownToLine,
  AlertTriangle,
  Users,
  DollarSign,
  Settings,
  ShieldAlert
} from "lucide-react";
import SidebarNav from "./sidebar-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Restrict access to ADMIN
  if (session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center py-20 px-4 text-center">
          <ShieldAlert className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-white">Role Access Restricted</h2>
          <p className="text-xs text-slate-450 mt-1 max-w-sm">This dashboard is restricted to system administrators.</p>
          <Link href="/" className="mt-4 text-xs font-bold text-primary hover:underline">Back to Homepage</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const navItems = [
    { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "NGO Verifications", href: "/dashboard/admin/verifications", icon: ShieldCheck },
    { name: "Campaigns", href: "/dashboard/admin/campaigns", icon: Megaphone },
    { name: "Withdrawals", href: "/dashboard/admin/withdrawals", icon: ArrowDownToLine },
    { name: "Complaints", href: "/dashboard/admin/complaints", icon: AlertTriangle },
    { name: "Users", href: "/dashboard/admin/users", icon: Users },
    { name: "Transactions Ledger", href: "/dashboard/admin/transactions", icon: DollarSign },
    { name: "Platform Settings", href: "/dashboard/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 rounded-2xl glass-card p-5 space-y-4">
            <div className="px-3 py-2 border-b border-slate-800 pb-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Super Administrator</span>
              <h3 className="font-extrabold text-sm text-white mt-1 truncate">
                {session.user.name || "Admin Portal"}
              </h3>
            </div>
            
            <SidebarNav items={navItems} />
          </div>
        </aside>

        {/* Dynamic page content */}
        <main className="flex-grow min-w-0">
          {children}
        </main>

      </div>

      <Footer />
    </div>
  );
}
