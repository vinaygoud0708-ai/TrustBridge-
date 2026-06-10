import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  Plus, 
  ArrowDownToLine, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  XCircle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import CharityCharts from "@/components/charity/charity-charts";

export default async function CharityDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Double guard - redirect if no organization is created
  if (!session.user.orgId) {
    redirect("/register/charity");
  }

  const orgId = session.user.orgId;

  // Fetch organization profile
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      campaigns: {
        orderBy: { createdAt: "desc" },
      },
      withdrawals: {
        orderBy: { requestedAt: "desc" },
      },
    },
  });

  if (!org) {
    redirect("/register/charity");
  }

  // Calculate stats
  const totalRaised = org.totalRaised || 0;
  
  // Sum disbursed & approved withdrawals
  const totalWithdrawn = org.withdrawals
    .filter(w => w.status === "DISBURSED" || w.status === "APPROVED")
    .reduce((sum, w) => sum + w.requestedAmount, 0);

  const escrowBalance = Math.max(0, totalRaised - totalWithdrawn);
  
  const activeCampaignsCount = org.campaigns.filter(c => c.status === "ACTIVE").length;
  const totalCampaignsCount = org.campaigns.length;

  // Prepare Campaign progress data for charts (Goal vs Raised)
  const campaignChartData = org.campaigns.slice(0, 5).map(c => ({
    title: c.title.length > 15 ? c.title.substring(0, 15) + "..." : c.title,
    raised: c.raisedAmount,
    goal: c.goalAmount,
  }));

  // Query donations to compile Monthly trends (last 6 months)
  const donations = await prisma.donation.findMany({
    where: {
      campaign: { organizationId: org.id },
      status: "SUCCESS",
    },
    orderBy: { createdAt: "asc" },
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyMap: { [key: string]: number } = {};

  // Initialize last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
    monthlyMap[label] = 0;
  }

  donations.forEach(donation => {
    const d = new Date(donation.createdAt);
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
    if (label in monthlyMap) {
      monthlyMap[label] += donation.amount;
    }
  });

  const monthlyChartData = Object.keys(monthlyMap).map(key => ({
    month: key,
    amount: monthlyMap[key],
  }));

  return (
    <div className="space-y-8 text-left">
      
      {/* Head Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">NGO Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Manage campaigns, process withdrawals, and track transparency metrics.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/charity/campaigns/new"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" /> Create Campaign
          </Link>
          <Link
            href="/dashboard/charity/withdraw"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            <ArrowDownToLine className="h-4 w-4" /> Request Fund Withdrawal
          </Link>
        </div>
      </div>

      {/* Verification / Compliance Warning Banner */}
      {org.status === "PENDING" && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
          <Clock className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-white mb-0.5">Registration Application Under Review</h4>
            <p className="text-slate-300 leading-relaxed">
              Your NGO registration profile and uploaded documents are currently pending administrator validation.
              You can create campaigns as draft, but they cannot accept payments until approved.
            </p>
          </div>
        </div>
      )}

      {org.status === "REJECTED" && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-250">
          <XCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-white mb-0.5">Registration Application Rejected</h4>
            <p className="text-slate-350 leading-relaxed">
              Administrators reviewed your credentials and rejected the application. Please update your details and documentation in settings.
            </p>
          </div>
        </div>
      )}

      {org.status === "SUSPENDED" && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-950/60 border border-rose-900 text-rose-200">
          <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-white mb-0.5">Account Suspended</h4>
            <p className="text-slate-300 leading-relaxed">
              This charity profile is currently suspended due to complaints or compliance failures. All fundraising campaigns have been frozen.
            </p>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat 1: Total Raised */}
        <div className="p-6 rounded-2xl bg-slate-905 border border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Raised</span>
            <span className="text-2xl font-black text-white block">${totalRaised.toLocaleString()}</span>
            <span className="text-[9px] text-slate-400 block">Gross funding received</span>
          </div>
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Stat 2: Escrow Balance */}
        <div className="p-6 rounded-2xl bg-slate-905 border border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Escrow Balance</span>
            <span className="text-2xl font-black text-emerald-400 block">${escrowBalance.toLocaleString()}</span>
            <span className="text-[9px] text-slate-400 block">Locked platform funds</span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <ArrowDownToLine className="h-5 w-5" />
          </div>
        </div>

        {/* Stat 3: Campaigns */}
        <div className="p-6 rounded-2xl bg-slate-905 border border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Campaigns</span>
            <span className="text-2xl font-black text-white block">{activeCampaignsCount} <span className="text-xs font-normal text-slate-500">/ {totalCampaignsCount}</span></span>
            <span className="text-[9px] text-slate-400 block">Active vs total campaigns</span>
          </div>
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        {/* Stat 4: Trust Score */}
        <div className="p-6 rounded-2xl bg-slate-905 border border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Trust Score</span>
            <span className="text-2xl font-black text-white block flex items-baseline gap-1">
              {org.trustScore.toFixed(1)} <span className="text-[10px] text-slate-450 font-normal">/ 5.0</span>
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full",
                org.verificationTier === "GOLD" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                org.verificationTier === "SILVER" && "bg-slate-300/10 text-slate-350 border border-slate-300/20",
                org.verificationTier === "BRONZE" && "bg-amber-700/10 text-amber-700 border border-amber-700/20"
              )}>
                {org.verificationTier}
              </span>
            </div>
          </div>
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
            <Award className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Visual Analytics */}
      <CharityCharts campaignData={campaignChartData} monthlyData={monthlyChartData} />

      {/* Active Campaigns list */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Campaign Overview</h3>
            <p className="text-xs text-slate-500 mt-1">Status and funding details for all campaigns.</p>
          </div>
          <Link 
            href="/dashboard/charity/campaigns" 
            className="text-xs text-primary font-bold hover:underline"
          >
            View All Campaigns
          </Link>
        </div>

        {org.campaigns.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-500 italic block mb-3">No campaigns created yet.</span>
            <Link
              href="/dashboard/charity/campaigns/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-all"
            >
              <Plus className="h-4 w-4" /> Start Your First Campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-400">
              <thead>
                <tr className="border-b border-slate-800 pb-3 text-slate-500 text-[10px] uppercase font-bold tracking-wider text-left">
                  <th className="py-3 px-2">Campaign</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Raised / Goal</th>
                  <th className="py-3 px-2 text-center">Progress</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {org.campaigns.slice(0, 4).map((campaign) => {
                  const percent = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
                  return (
                    <tr key={campaign.id} className="hover:bg-slate-800/10 transition-all">
                      <td className="py-3.5 px-2">
                        <div>
                          <span className="font-bold text-white block">{campaign.title}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{campaign.category} • {campaign.location}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1",
                          campaign.status === "ACTIVE" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                          campaign.status === "DRAFT" && "bg-slate-700/20 text-slate-400 border border-slate-750",
                          campaign.status === "PENDING" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                          campaign.status === "COMPLETED" && "bg-primary/10 text-primary border border-primary/20",
                          campaign.status === "REJECTED" && "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        )}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right font-semibold text-white">
                        ${campaign.raisedAmount.toLocaleString()} <span className="text-slate-500 font-normal">/ ${campaign.goalAmount.toLocaleString()}</span>
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="max-w-[100px] mx-auto space-y-1 text-center">
                          <div className="w-full bg-slate-800 rounded-full h-1.5">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-[9px] text-slate-400 font-semibold">{percent}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/charity/campaigns/${campaign.id}/analytics`}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-[10px] font-bold text-white hover:bg-slate-700 transition-all inline-flex items-center gap-1"
                          >
                            <TrendingUp className="h-3 w-3 text-emerald-400" /> Analytics
                          </Link>
                          <Link
                            href={`/dashboard/charity/campaigns/${campaign.id}/update`}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-[10px] font-bold text-white hover:bg-slate-700 transition-all inline-flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3 text-primary" /> Post Update
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
