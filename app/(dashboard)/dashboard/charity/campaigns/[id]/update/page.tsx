import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";
import CampaignUpdateForm from "@/components/charity/campaign-update-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignUpdatePage({ params }: PageProps) {
  const { id: campaignId } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user.orgId) {
    redirect("/login");
  }

  // Fetch campaign
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      updates: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Verify ownership
  if (!campaign || campaign.organizationId !== session.user.orgId) {
    redirect("/dashboard/charity/campaigns");
  }

  return (
    <div className="space-y-6 text-left">
      {/* Back button */}
      <div>
        <Link 
          href="/dashboard/charity/campaigns" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-455 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Campaigns
        </Link>
      </div>

      {/* Title block */}
      <div>
        <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1">
          <Megaphone className="h-3 w-3" /> Timeline Log
        </span>
        <h1 className="text-xl font-black text-white mt-1">Updates Manager: {campaign.title}</h1>
        <p className="text-xs text-slate-400 mt-1">Broadcast progress milestones directly to your campaign's financial supporters.</p>
      </div>

      {/* Interactive Update form and list */}
      <CampaignUpdateForm 
        campaignId={campaign.id} 
        campaignTitle={campaign.title} 
        initialUpdates={campaign.updates} 
      />

    </div>
  );
}
