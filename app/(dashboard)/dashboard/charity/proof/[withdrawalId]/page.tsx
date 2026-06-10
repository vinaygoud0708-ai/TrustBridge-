import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import ProofUploader from "@/components/charity/proof-uploader";

interface PageProps {
  params: Promise<{ withdrawalId: string }>;
}

export default async function ProofUploaderPage({ params }: PageProps) {
  const { withdrawalId } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user.orgId) {
    redirect("/login");
  }

  // Fetch the withdrawal request
  const withdrawal = await prisma.withdrawalRequest.findUnique({
    where: { id: withdrawalId },
    include: {
      campaign: {
        select: { title: true },
      },
      fundUsages: {
        orderBy: { uploadedAt: "desc" },
      },
    },
  });

  if (!withdrawal || withdrawal.organizationId !== session.user.orgId) {
    redirect("/dashboard/charity");
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* Back link */}
      <div>
        <Link 
          href="/dashboard/charity/withdraw" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-450 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Withdrawals
        </Link>
      </div>

      {/* Title */}
      <div>
        <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Audit Verification
        </span>
        <h1 className="text-xl font-black text-white mt-1">Upload Expense Proofs</h1>
        <p className="text-xs text-slate-400 mt-1">
          Campaign: <span className="text-white font-bold">{withdrawal.campaign.title}</span> • Withdrawal Ref: <span className="text-white font-semibold">{withdrawal.id.substring(0, 8)}...</span>
        </p>
      </div>

      {/* Render Proof Uploader */}
      <ProofUploader 
        withdrawalId={withdrawal.id} 
        withdrawalAmount={withdrawal.requestedAmount} 
        campaignTitle={withdrawal.campaign.title} 
        initialProofs={withdrawal.fundUsages} 
      />

    </div>
  );
}
