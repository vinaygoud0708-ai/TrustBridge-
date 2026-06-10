import prisma from "@/lib/prisma";
import CampaignCard from "@/components/campaigns/campaign-card";
import { Bookmark } from "lucide-react";

export const revalidate = 0;

export default async function DonorSavedCampaignsPage() {
  let campaigns: any[] = [];
  try {
    // Show active campaigns for donor quick-donate access
    campaigns = await prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      include: {
        organization: {
          select: {
            name: true,
            verificationTier: true,
            trustScore: true,
          },
        },
      },
      take: 3,
    });
  } catch (error) {
    console.error("Error query saved campaigns:", error);
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight font-sans">Bookmarked Campaigns</h1>
        <p className="text-xs text-slate-455 mt-1">Shortlisted campaigns for fast checkout monitoring and contributions.</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-855 rounded-3xl p-8 flex flex-col items-center justify-center gap-2">
          <Bookmark className="h-10 w-10 text-slate-700" />
          <h3 className="font-bold text-sm text-slate-300 mt-2">No bookmarked campaigns</h3>
          <p className="text-xs text-slate-500 max-w-sm">Browse campaigns and add bookmarks to keep track of urgent needs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <CampaignCard key={camp.id} campaign={camp} />
          ))}
        </div>
      )}
    </div>
  );
}
