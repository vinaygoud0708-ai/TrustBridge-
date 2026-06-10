import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import ReportForm from "./report-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportCampaignPage({ params }: PageProps) {
  const { id: campaignId } = await params;

  // Fetch campaign
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      organization: {
        select: { id: true, name: true },
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Back button */}
      <div className="mb-6">
        <Link 
          href={`/campaigns/${campaignId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-450 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Campaign
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2 mb-8">
        <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider flex items-center gap-1">
          <AlertTriangle className="h-3.5 w-3.5" /> Platform Dispute Resolution
        </span>
        <h1 className="text-xl font-black text-white">Report Campaign: {campaign.title}</h1>
        <p className="text-xs text-slate-400">
          File an official dispute regarding this campaign. All complaints are verified by platform auditors.
        </p>
      </div>

      {/* Render Client Side Report Form */}
      <ReportForm 
        campaignId={campaign.id} 
        organizationId={campaign.organization.id} 
        orgName={campaign.organization.name} 
      />

    </div>
  );
}
