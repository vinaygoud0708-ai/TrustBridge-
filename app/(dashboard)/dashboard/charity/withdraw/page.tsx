import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ArrowDownToLine } from "lucide-react";
import WithdrawForm from "@/components/charity/withdraw-form";

export default async function WithdrawPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.orgId) {
    redirect("/login");
  }

  const orgId = session.user.orgId;

  // Fetch campaigns for dropdown selection (must be ACTIVE or COMPLETED to withdraw funds)
  const campaigns = await prisma.campaign.findMany({
    where: {
      organizationId: orgId,
      status: { in: ["ACTIVE", "COMPLETED"] },
    },
    select: {
      id: true,
      title: true,
      raisedAmount: true,
      withdrawals: {
        select: {
          requestedAmount: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch recent withdrawals history for listing
  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { organizationId: orgId },
    include: {
      campaign: {
        select: { title: true },
      },
    },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Back Link */}
      <div>
        <Link 
          href="/dashboard/charity" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-450 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Title */}
      <div>
        <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1">
          <ArrowDownToLine className="h-3 w-3" /> Escrow Disbursements
        </span>
        <h1 className="text-xl font-black text-white mt-1">Escrow Fund Withdrawal</h1>
        <p className="text-xs text-slate-400 mt-1">Request the release of campaign donations from escrow to fund itemized budget allocations.</p>
      </div>

      {/* Render Withdraw Form component */}
      <WithdrawForm campaigns={campaigns} recentWithdrawals={withdrawals} />

    </div>
  );
}
