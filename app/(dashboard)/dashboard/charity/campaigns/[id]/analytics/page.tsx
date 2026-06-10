import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Award, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignAnalyticsPage({ params }: PageProps) {
  const { id: campaignId } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user.orgId) {
    redirect("/login");
  }

  // Fetch campaign with donations, updates, and withdrawals
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      donations: {
        where: { status: "SUCCESS" },
        orderBy: { createdAt: "desc" },
        include: { donor: true },
      },
      withdrawals: {
        orderBy: { requestedAt: "desc" },
      },
    },
  });

  if (!campaign || campaign.organizationId !== session.user.orgId) {
    redirect("/dashboard/charity/campaigns");
  }

  // Calculate campaign metrics
  const totalRaised = campaign.raisedAmount;
  const goalAmount = campaign.goalAmount;
  const percent = Math.min(100, Math.round((totalRaised / goalAmount) * 100));
  const totalDonors = campaign.donations.length;
  
  const averageDonation = totalDonors > 0 ? totalRaised / totalDonors : 0;
  const largestDonation = totalDonors > 0 
    ? Math.max(...campaign.donations.map(d => d.amount)) 
    : 0;

  // Sum approved/disbursed withdrawals for this campaign
  const campaignWithdrawn = campaign.withdrawals
    .filter(w => w.status === "DISBURSED" || w.status === "APPROVED")
    .reduce((sum, w) => sum + w.requestedAmount, 0);

  const campaignEscrowBalance = Math.max(0, totalRaised - campaignWithdrawn);

  return (
    <div className="space-y-8 text-left">
      
      {/* Back to campaigns */}
      <div>
        <Link 
          href="/dashboard/charity/campaigns" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-450 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Campaigns
        </Link>
      </div>

      {/* Title Panel */}
      <div>
        <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> Campaign Performance & Audit
        </span>
        <h1 className="text-xl font-black text-white mt-1">Analytics: {campaign.title}</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time stats, donation breakdown, and escrow ledger matching.</p>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Raised vs Goal */}
        <div className="p-5 rounded-2xl bg-slate-905 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Fundraising Progress</span>
          <span className="text-xl font-black text-white mt-1 block">
            ${totalRaised.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ ${goalAmount.toLocaleString()}</span>
          </span>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${percent}%` }} />
          </div>
          <span className="text-[9px] text-slate-450 block mt-1.5 font-semibold text-right">{percent}% Completed</span>
        </div>

        {/* Escrow Balance */}
        <div className="p-5 rounded-2xl bg-slate-905 border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Escrow Balance</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">
              ${campaignEscrowBalance.toLocaleString()}
            </span>
          </div>
          <span className="text-[9px] text-slate-450 block mt-2">
            Disbursed: ${campaignWithdrawn.toLocaleString()}
          </span>
        </div>

        {/* Donors Count */}
        <div className="p-5 rounded-2xl bg-slate-905 border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Total Supporters</span>
            <span className="text-xl font-black text-white mt-1 block flex items-center gap-1.5">
              <Users className="h-5 w-5 text-purple-400" /> {totalDonors}
            </span>
          </div>
          <span className="text-[9px] text-slate-450 block mt-2">
            Average Donation: ${averageDonation.toFixed(2)}
          </span>
        </div>

        {/* Largest Contribution */}
        <div className="p-5 rounded-2xl bg-slate-905 border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Largest Gift</span>
            <span className="text-xl font-black text-white mt-1 block flex items-center gap-1.5">
              <DollarSign className="h-5 w-5 text-amber-400" /> ${largestDonation.toLocaleString()}
            </span>
          </div>
          <span className="text-[9px] text-slate-450 block mt-2">
            Direct transparent peer donation
          </span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left: Donor list ledger (Col Span 3) */}
        <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Supporters Ledger</h3>
            <p className="text-xs text-slate-500 mt-1">Itemized list of all successful contributions to this campaign.</p>
          </div>

          {campaign.donations.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-850 rounded-2xl">
              <span className="text-xs text-slate-500 italic">No donations received yet.</span>
            </div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin">
              {campaign.donations.map((d) => (
                <div key={d.id} className="p-4 rounded-2xl bg-slate-955 border border-slate-850/60 flex justify-between items-start">
                  <div className="space-y-1.5">
                    <span className="font-bold text-xs text-white">
                      {d.isAnonymous ? "Anonymous Donor" : (d.donorName || d.donor?.name || "Guest Donor")}
                    </span>
                    {d.message && (
                      <p className="text-slate-400 text-xs italic">"{d.message}"</p>
                    )}
                    <div className="flex gap-2 items-center text-[9px] text-slate-500">
                      <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                      {d.donorEmail && (
                        <span>• {d.donorEmail}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-black text-emerald-400 text-xs">${d.amount}</span>
                    {d.receiptUrl && (
                      <Link 
                        href={`/api/donations/${d.id}/receipt`}
                        target="_blank"
                        className="text-[9px] text-primary hover:underline font-bold block"
                      >
                        Download PDF
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Withdrawals related to this campaign (Col Span 2) */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">Escrow Disbursements</h3>
              <p className="text-xs text-slate-500 mt-1">Escrow fund withdrawal ledger for itemized budgets.</p>
            </div>
            <Link 
              href="/dashboard/charity/withdraw" 
              className="text-[10px] text-primary hover:underline font-bold"
            >
              New Request
            </Link>
          </div>

          {campaign.withdrawals.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-850 rounded-2xl">
              <span className="text-xs text-slate-500 italic">No withdrawals requested for this campaign.</span>
            </div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin">
              {campaign.withdrawals.map((w) => (
                <div key={w.id} className="p-4 rounded-2xl bg-slate-905 border border-slate-850 space-y-3">
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <span className="font-bold text-xs text-white block">Withdrawal Request</span>
                      <span className="text-[10px] text-slate-450 block mt-0.5">Amount: <strong className="text-white">${w.requestedAmount}</strong></span>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold border",
                      w.status === "DISBURSED" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      w.status === "PENDING" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      w.status === "APPROVED" && "bg-primary/10 text-primary border-primary/20",
                      w.status === "REJECTED" && "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    )}>
                      {w.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 line-clamp-2">{w.purpose}</p>

                  <div className="flex justify-between items-center text-[9px] text-slate-550 border-t border-slate-850/50 pt-2.5">
                    <span>{new Date(w.requestedAt).toLocaleDateString()}</span>
                    
                    {/* Action conditional based on proof status */}
                    {w.status === "DISBURSED" ? (
                      w.proofUploaded ? (
                        <span className="text-emerald-400 font-bold inline-flex items-center gap-0.5">
                          ✓ Bills Uploaded
                        </span>
                      ) : (
                        <Link 
                          href={`/dashboard/charity/proof/${w.id}`}
                          className="text-primary hover:underline font-extrabold inline-flex items-center gap-0.5"
                        >
                          <Upload className="h-3 w-3" /> Upload Bills
                        </Link>
                      )
                    ) : (
                      <span className="text-slate-500 italic">Disbursement pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
