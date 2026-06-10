import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowDownToLine, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  Layers, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminCharts from "@/components/admin/admin-charts";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Database Queries
  // 1. Total processed donations
  const totalDonationsAggregate = await prisma.donation.aggregate({
    where: { status: "SUCCESS" },
    _sum: { amount: true },
  });
  const totalGrossDonated = totalDonationsAggregate._sum.amount || 0;

  // Calculate system commissions (5% fee)
  const systemCommissions = totalGrossDonated * 0.05;

  // 2. Total disbursed escrow
  const disbursedAggregate = await prisma.withdrawalRequest.aggregate({
    where: { status: "DISBURSED" },
    _sum: { requestedAmount: true },
  });
  const totalDisbursed = disbursedAggregate._sum.requestedAmount || 0;

  // Available Escrow held in system
  const netEscrowHeld = Math.max(0, totalGrossDonated - totalDisbursed - systemCommissions);

  // 3. Count queues
  const pendingVerificationsCount = await prisma.organization.count({
    where: { status: "PENDING" },
  });

  const pendingWithdrawalsCount = await prisma.withdrawalRequest.count({
    where: { status: "PENDING" },
  });

  const openComplaintsCount = await prisma.complaint.count({
    where: { status: { in: ["OPEN", "INVESTIGATING"] } },
  });

  // 4. Quick List Queue Previews
  const pendingOrgs = await prisma.organization.findMany({
    where: { status: "PENDING" },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const pendingWithdrawals = await prisma.withdrawalRequest.findMany({
    where: { status: "PENDING" },
    include: {
      campaign: { select: { title: true } },
      organization: { select: { name: true } },
    },
    take: 3,
    orderBy: { requestedAt: "desc" },
  });

  const activeComplaints = await prisma.complaint.findMany({
    where: { status: "OPEN" },
    include: {
      organization: { select: { name: true } },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  // Compile monthly volumes for charts
  const donations = await prisma.donation.findMany({
    where: { status: "SUCCESS" },
    orderBy: { createdAt: "asc" },
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyMap: { [key: string]: number } = {};

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

  // Compile category breakdown for charts
  const campaigns = await prisma.campaign.findMany({
    select: { category: true },
  });

  const categoryMap: { [key: string]: number } = {};
  campaigns.forEach(c => {
    categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
  });

  const categoryChartData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key],
  }));

  return (
    <div className="space-y-8 text-left">
      
      {/* Head */}
      <div>
        <h1 className="text-2xl font-black text-white">Administrator Control Panel</h1>
        <p className="text-xs text-slate-400 mt-1">Audit verification queues, process disbursements, resolve disputes, and track platform economics.</p>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat 1: Total Gross Donations */}
        <div className="p-6 rounded-2xl bg-slate-905 border border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Donations Volume</span>
            <span className="text-2xl font-black text-white block">${totalGrossDonated.toLocaleString()}</span>
            <span className="text-[9px] text-slate-400 block">Gross platform donations volume</span>
          </div>
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Stat 2: Escrow Locked */}
        <div className="p-6 rounded-2xl bg-slate-905 border border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Net Escrow Held</span>
            <span className="text-2xl font-black text-emerald-400 block">${netEscrowHeld.toLocaleString()}</span>
            <span className="text-[9px] text-slate-400 block">Funds locked in escrow pool</span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <ArrowDownToLine className="h-5 w-5" />
          </div>
        </div>

        {/* Stat 3: Commissions */}
        <div className="p-6 rounded-2xl bg-slate-905 border border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Commissions (5%)</span>
            <span className="text-2xl font-black text-white block">${systemCommissions.toLocaleString()}</span>
            <span className="text-[9px] text-slate-405 block">Auto-deducted operating fee</span>
          </div>
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Stat 4: Disbursements */}
        <div className="p-6 rounded-2xl bg-slate-905 border border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Released Escrow</span>
            <span className="text-2xl font-black text-white block">${totalDisbursed.toLocaleString()}</span>
            <span className="text-[9px] text-slate-400 block">Total charity transfers logged</span>
          </div>
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Verification Queues Counters Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* NGO Verification */}
        <Link 
          href="/dashboard/admin/verifications"
          className="p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">NGO Verifications Queue</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Pending approvals</span>
            </div>
          </div>
          <span className="text-lg font-black text-primary">{pendingVerificationsCount}</span>
        </Link>

        {/* Withdrawals */}
        <Link 
          href="/dashboard/admin/withdrawals"
          className="p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-450">
              <ArrowDownToLine className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Disbursement Requests</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Waiting validation</span>
            </div>
          </div>
          <span className="text-lg font-black text-emerald-450">{pendingWithdrawalsCount}</span>
        </Link>

        {/* Complaints */}
        <Link 
          href="/dashboard/admin/complaints"
          className="p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Disputes & Complaints</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Active open investigations</span>
            </div>
          </div>
          <span className="text-lg font-black text-rose-550">{openComplaintsCount}</span>
        </Link>

      </div>

      {/* Visual Charts */}
      <AdminCharts monthlyVolume={monthlyChartData} categoryBreakdown={categoryChartData} />

      {/* Split lists: NGO Verifications & Disbursements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* NGO Verification column */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">New Registrations</h3>
            <Link href="/dashboard/admin/verifications" className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5">
              Queue <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {pendingOrgs.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-850 rounded-2xl">
              <span className="text-[10px] text-slate-500 italic">No registrations pending review.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrgs.map((org) => (
                <div key={org.id} className="p-3 bg-slate-905 border border-slate-850/80 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white block">{org.name}</span>
                    <span className="text-[9px] text-slate-550 mt-0.5 block">Tax ID: {org.taxId}</span>
                  </div>
                  <Link 
                    href="/dashboard/admin/verifications"
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    Audit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawal Requests column */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">Pending Withdrawals</h3>
            <Link href="/dashboard/admin/withdrawals" className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5">
              Queue <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-850 rounded-2xl">
              <span className="text-[10px] text-slate-500 italic">No disbursements waiting validation.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.map((w) => (
                <div key={w.id} className="p-3 bg-slate-905 border border-slate-850/80 rounded-xl flex justify-between items-center text-xs">
                  <div className="max-w-[150px]">
                    <span className="font-bold text-white block truncate">{w.campaign.title}</span>
                    <span className="text-[9px] text-slate-550 mt-0.5 block truncate">By {w.organization.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-450 block">${w.requestedAmount}</span>
                    <Link 
                      href="/dashboard/admin/withdrawals"
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      Audit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complaints column */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">Active Disputes</h3>
            <Link href="/dashboard/admin/complaints" className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5">
              Queue <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {activeComplaints.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-850 rounded-2xl">
              <span className="text-[10px] text-slate-500 italic">No active disputes logged.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {activeComplaints.map((c) => (
                <div key={c.id} className="p-3 bg-slate-905 border border-slate-850/80 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white block">{c.type} Complaint</span>
                    <span className="text-[9px] text-slate-550 mt-0.5 block">Against {c.organization.name}</span>
                  </div>
                  <Link 
                    href="/dashboard/admin/complaints"
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    Solve
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
