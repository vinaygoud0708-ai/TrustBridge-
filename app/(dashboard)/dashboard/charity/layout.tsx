import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { ShieldAlert } from "lucide-react";
import SidebarNav from "./sidebar-nav";

export default async function CharityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Restrict access to CHARITY and ADMIN
  if (session.user.role !== "CHARITY" && session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center py-20 px-4 text-center">
          <ShieldAlert className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-white">Role Access Restricted</h2>
          <p className="text-xs text-slate-450 mt-1 max-w-sm">This dashboard is only accessible to charity organization members.</p>
          <Link href="/" className="mt-4 text-xs font-bold text-primary hover:underline">Back to Homepage</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // If role is CHARITY but no organization registered, redirect to wizard
  if (session.user.role === "CHARITY" && !session.user.orgId) {
    redirect("/register/charity");
  }

  const navItems = [
    { name: "Overview", href: "/dashboard/charity", iconName: "LayoutDashboard" },
    { name: "Campaigns", href: "/dashboard/charity/campaigns", iconName: "Megaphone" },
    { name: "Withdrawals", href: "/dashboard/charity/withdraw", iconName: "ArrowDownToLine" },
    { name: "Trust Score", href: "/dashboard/charity/trust-score", iconName: "Award" },
    { name: "Settings", href: "/dashboard/charity/settings", iconName: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 rounded-2xl glass-card p-5 space-y-4">
            <div className="px-3 py-2 border-b border-slate-800 pb-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Charity Partner</span>
              <h3 className="font-extrabold text-sm text-white mt-1 truncate">
                {session.user.name || "My Organization"}
              </h3>
            </div>
            
            <SidebarNav items={navItems} />
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-grow min-w-0">
          {children}
        </main>

      </div>

      <Footer />
    </div>
  );
}
