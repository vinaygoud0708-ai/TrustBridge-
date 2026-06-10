import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import ComplaintsDashboard from "@/components/admin/complaints-dashboard";

export default async function AdminComplaintsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all registered complaints
  const complaints = await prisma.complaint.findMany({
    include: {
      organization: {
        select: { name: true },
      },
      campaign: {
        select: { title: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Back link */}
      <div>
        <Link 
          href="/dashboard/admin" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-455 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Overview
        </Link>
      </div>

      {/* Head */}
      <div>
        <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5" /> Disputes Auditor
        </span>
        <h1 className="text-xl font-black text-white mt-1">Disputes & Complaints Console</h1>
        <p className="text-xs text-slate-400 mt-1">Review donor dispute reports, evaluate submitted evidence sheets, and issue compliance orders.</p>
      </div>

      {/* Render Complaints Dashboard */}
      <ComplaintsDashboard complaints={complaints} />

    </div>
  );
}
