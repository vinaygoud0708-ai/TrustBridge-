import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, DollarSign, Calendar, Eye, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AdminTransactionsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all transactions
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      donation: {
        select: {
          donorName: true,
          donorEmail: true,
          campaign: { select: { title: true } },
        },
      },
    },
  });

  // Calculate aggregates
  const totalVolume = transactions
    .filter(t => t.type === "DONATION" && t.status === "SUCCESS")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCommissions = transactions
    .filter(t => t.type === "COMMISSION" && t.status === "SUCCESS")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayouts = transactions
    .filter(t => t.type === "WITHDRAWAL" && t.status === "SUCCESS")
    .reduce((sum, t) => sum + t.amount, 0);

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
          <DollarSign className="h-3.5 w-3.5" /> Financial Auditing
        </span>
        <h1 className="text-xl font-black text-white mt-1">Platform Ledger & Transactions</h1>
        <p className="text-xs text-slate-400 mt-1">Platform-wide financial auditing logs, donor receipts, and escrow withdrawals registry.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-slate-905 border border-slate-850 rounded-2xl">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Gross Donations Volume</span>
          <span className="text-xl font-black text-white mt-1 block">${totalVolume.toLocaleString()}</span>
        </div>
        <div className="p-5 bg-slate-905 border border-slate-850 rounded-2xl">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Net Escrow Payouts</span>
          <span className="text-xl font-black text-emerald-450 mt-1 block">${totalPayouts.toLocaleString()}</span>
        </div>
        <div className="p-5 bg-slate-905 border border-slate-850 rounded-2xl">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Total Commission Collected</span>
          <span className="text-xl font-black text-primary mt-1 block">${totalCommissions.toLocaleString()}</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-3 mb-4">
          Ledger Records ({transactions.length})
        </h3>

        {transactions.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-850 rounded-2xl">
            <HelpCircle className="h-8 w-8 text-slate-650 mx-auto mb-2" />
            <span className="text-xs text-slate-500 italic">No transactions captured in ledger logs.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-400">
              <thead>
                <tr className="border-b border-slate-800 pb-3 text-slate-500 text-[10px] uppercase font-bold tracking-wider text-left">
                  <th className="py-3 px-2">Ref Code</th>
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2">Description</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Settled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-805/40">
                {transactions.map((t) => {
                  let desc = "Platform ledger entry";
                  if (t.type === "DONATION" && t.donation) {
                    desc = `Donation to "${t.donation.campaign.title}"`;
                  } else if (t.type === "COMMISSION") {
                    desc = "Platform commission deduction fee (5%)";
                  } else if (t.type === "WITHDRAWAL") {
                    desc = "Disbursed escrow withdrawal";
                  }

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/10 transition-all">
                      <td className="py-3.5 px-2">
                        <span className="font-bold text-white font-mono">{t.reference}</span>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-extrabold border",
                          t.type === "DONATION" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                          t.type === "WITHDRAWAL" && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                          t.type === "COMMISSION" && "bg-amber-500/10 text-amber-450 border border-amber-500/20",
                          t.type === "REFUND" && "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="text-slate-300 font-medium block truncate max-w-[200px]">{desc}</span>
                        {t.donation?.donorName && (
                          <span className="text-[9px] text-slate-500 mt-0.5 block">By: {t.donation.donorName}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right font-bold text-white">
                        ${t.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-2">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold inline-flex items-center gap-0.5",
                          t.status === "SUCCESS" && "text-emerald-400",
                          t.status === "PENDING" && "text-amber-450",
                          t.status === "FAILED" && "text-rose-500"
                        )}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right text-slate-500 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
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
