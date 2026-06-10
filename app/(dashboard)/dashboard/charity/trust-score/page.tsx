import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  HelpCircle,
  FileSpreadsheet,
  Users,
  ShieldAlert,
  Calendar,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { recalculateTrustScore } from "@/lib/trust-score";

export default async function CharityTrustScorePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.orgId) {
    redirect("/login");
  }

  const orgId = session.user.orgId;

  // Sync / Recalculate trust score before rendering
  await recalculateTrustScore(orgId);

  // Fetch the organization and score breakdown details
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      trustScoreBreakdown: true,
      campaigns: { select: { id: true, status: true } },
      reviews: { select: { rating: true } },
      withdrawals: { select: { id: true, proofUploaded: true, status: true } },
    },
  });

  if (!org) {
    redirect("/register/charity");
  }

  const score = org.trustScoreBreakdown || {
    verificationScore: 10,
    reportingScore: 25,
    donorRatingScore: 20,
    completionScore: 15,
    complaintScore: 10,
    totalScore: 80,
    lastCalculated: new Date(),
  };

  const scoreTierColor = cn(
    org.verificationTier === "GOLD" && "text-amber-400 bg-amber-500/10 border-amber-500/20",
    org.verificationTier === "SILVER" && "text-slate-350 bg-slate-300/10 border-slate-300/20",
    org.verificationTier === "BRONZE" && "text-amber-700 bg-amber-700/10 border-amber-700/20"
  );

  return (
    <div className="space-y-8 text-left">
      
      {/* Back link */}
      <div>
        <Link 
          href="/dashboard/charity" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-455 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Head */}
      <div>
        <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1">
          <Award className="h-3.5 w-3.5" /> Platform Reputation Engine
        </span>
        <h1 className="text-xl font-black text-white mt-1">Reputation Score Breakdown</h1>
        <p className="text-xs text-slate-400 mt-1">
          TrustBridge grades NGOs dynamically based on credentials, itemized budget reporting, donor reviews, and complaints logs.
        </p>
      </div>

      {/* Main Score Index card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-sm uppercase font-bold tracking-wider text-slate-400">Total Trust Rating</h2>
            <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-bold border", scoreTierColor)}>
              {org.verificationTier} TIER
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{org.trustScore.toFixed(2)}</span>
            <span className="text-xs text-slate-500 font-bold">/ 5.0 stars</span>
          </div>

          <p className="text-xs text-slate-450 leading-relaxed max-w-md">
            This reputation stars value is scaled directly from your cumulative index score of <strong>{score.totalScore.toFixed(1)} / 100 points</strong>. Keep documents updated and invoices uploaded to increase your tier.
          </p>

          <span className="text-[9px] text-slate-500 block flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-600" />
            Last Engine recalculation: {new Date(score.lastCalculated).toLocaleString()}
          </span>
        </div>

        {/* Stars representation */}
        <div className="flex flex-col items-center p-6 bg-slate-950/60 rounded-2xl border border-slate-850 text-center w-full md:w-56 shrink-0">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block mb-2">Reputation Index</span>
          <div className="flex gap-1 mb-2 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => {
              const active = Math.round(org.trustScore) >= s;
              return <Star key={s} className={cn("h-6 w-6", active ? "fill-amber-400" : "text-slate-700")} />;
            })}
          </div>
          <span className="text-xs text-slate-300 font-bold mt-1">
            {score.totalScore.toFixed(0)} Points Index
          </span>
        </div>
      </div>

      {/* Breakdown Metrics List */}
      <div className="space-y-6">
        <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2">
          Reputation Metrics Audit
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Metric 1: Verification Score */}
          <div className="bg-slate-905 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-xs text-white block">1. Legal Credentials Tier</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Based on document verification and registration audits.</span>
              </div>
              <span className="font-black text-xs text-white">{score.verificationScore} / 30 pts</span>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${(score.verificationScore / 30) * 100}%` }} />
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed space-y-1.5 pt-2 border-t border-slate-850/50">
              <div className="flex items-center justify-between">
                <span>Bronze Tier Registration (Standard Baseline)</span>
                <span className="text-white font-bold">10 Pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Silver Tier Registration (Tax exemptions verified)</span>
                <span className="text-white font-bold">20 Pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Gold Tier Registration (KYC & founder IDs audited)</span>
                <span className="text-white font-bold">30 Pts</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Reporting Score */}
          <div className="bg-slate-905 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-xs text-white block">2. Itemized Spending Reporting</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Upload invoice logs within 30 days of escrow releases.</span>
              </div>
              <span className="font-black text-xs text-white">{score.reportingScore.toFixed(1)} / 25 pts</span>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-2">
              <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${(score.reportingScore / 25) * 100}%` }} />
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed pt-2 border-t border-slate-850/50">
              <p>
                Formula: <code className="text-white">(disbursed withdrawals with uploaded bills / total disbursed withdrawals) * 25</code>
              </p>
              <div className="flex justify-between items-center mt-2.5 text-[9px] text-slate-500 font-bold">
                <span>Disbursed withdrawals: {org.withdrawals.filter(w => w.status === "DISBURSED").length}</span>
                <span>Invoiced releases: {org.withdrawals.filter(w => w.status === "DISBURSED" && w.proofUploaded).length}</span>
              </div>
            </div>
          </div>

          {/* Metric 3: Donor Rating Score */}
          <div className="bg-slate-905 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-xs text-white block">3. Donor Reviews & Feedback</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Average reviews and rating from verified campaign contributors.</span>
              </div>
              <span className="font-black text-xs text-white">{score.donorRatingScore.toFixed(1)} / 20 pts</span>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(score.donorRatingScore / 20) * 100}%` }} />
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed pt-2 border-t border-slate-850/50">
              <p>
                Formula: <code className="text-white">(average rating / 5.0) * 20</code>
              </p>
              <div className="flex justify-between items-center mt-2.5 text-[9px] text-slate-500 font-bold">
                <span>Total reviews logged: {org.reviews.length}</span>
                <span>NGO Average Rating: {(score.donorRatingScore * 5.0 / 20.0).toFixed(2)} Stars</span>
              </div>
            </div>
          </div>

          {/* Metric 4: Campaign Completion Ratio */}
          <div className="bg-slate-905 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-xs text-white block">4. Goal Completion Index</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Percentage of campaigns successfully finished.</span>
              </div>
              <span className="font-black text-xs text-white">{score.completionScore.toFixed(1)} / 15 pts</span>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-2">
              <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${(score.completionScore / 15) * 100}%` }} />
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed pt-2 border-t border-slate-850/50">
              <p>
                Formula: <code className="text-white">(completed campaigns / total campaigns) * 15</code>
              </p>
              <div className="flex justify-between items-center mt-2.5 text-[9px] text-slate-500 font-bold">
                <span>Total Campaigns: {org.campaigns.length}</span>
                <span>Completed: {org.campaigns.filter(c => c.status === "COMPLETED").length}</span>
              </div>
            </div>
          </div>

          {/* Metric 5: Complaints Deduction */}
          <div className="bg-slate-905 border border-slate-850 rounded-2xl p-5 space-y-4 md:col-span-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-xs text-white block">5. Dispute / Complaints Log Deduction</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Deductions made for validated disputes from supporters or regulators.</span>
              </div>
              <span className="font-black text-xs text-white">{score.complaintScore.toFixed(1)} / 10 pts</span>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(score.complaintScore / 10) * 100}%` }} />
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed pt-2 border-t border-slate-850/50 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
              <p>
                Formula: <code className="text-white">max(0, 10.0 - (complaintsCount * 2.0))</code>
              </p>
              <span className="text-[10px] font-bold text-slate-500 inline-flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-slate-655" />
                Active Complaint Logs: <strong className="text-white font-extrabold">{org.complaintsCount}</strong>
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
