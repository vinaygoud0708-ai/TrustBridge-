import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ArrowDownToLine } from "lucide-react";
import WithdrawalsDashboard from "@/components/admin/withdrawals-dashboard";

export default async function AdminWithdrawalsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch withdrawals requests
  const withdrawals = await prisma.withdrawalRequest.findMany({
    include: {
      campaign: {
        select: { title: true },
      },
      organization: {
        select: { name: true },
      },
    },
    orderBy: { requestedAt: "desc" },
  });

  // Fetch pending fund usages proofs
  const pendingProofs = await prisma.fundUsage.findMany({
    where: { status: "PENDING" },
    include: {
      campaign: {
        select: { title: true },
      },
    },
    orderBy: { uploadedAt: "desc" },
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
          <ArrowDownToLine className="h-3.5 w-3.5" /> Escrow Disbursements
        </span>
        <h1 className="text-xl font-black text-white mt-1">Escrow Withdrawals Auditor</h1>
        <p className="text-xs text-slate-400 mt-1">Release campaign funds from escrow, audit itemized justifications, and verify uploaded invoices.</p>
      </div>

      {/* Render Withdrawals Dashboard */}
      <WithdrawalsDashboard withdrawals={withdrawals} pendingProofs={pendingProofs} />

    </div>
  );
}
