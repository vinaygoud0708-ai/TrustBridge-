import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";
import CampaignApprovalDashboard from "@/components/admin/campaign-approval-dashboard";

export default async function AdminCampaignsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all registered campaigns
  const campaigns = await prisma.campaign.findMany({
    include: {
      organization: {
        select: {
          name: true,
          verificationTier: true,
        },
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
        <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1">
          <Megaphone className="h-3.5 w-3.5" /> Campaign Verifier
        </span>
        <h1 className="text-xl font-black text-white mt-1">Campaign Approval Console</h1>
        <p className="text-xs text-slate-400 mt-1">Audit campaign stories, verify itemized budgets, and flag urgent or featured campaigns.</p>
      </div>

      {/* Render Approval Dashboard */}
      <CampaignApprovalDashboard campaigns={campaigns} />

    </div>
  );
}
