import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import CampaignTabs from "@/components/campaigns/campaign-tabs";
import DonationPanel from "@/components/campaigns/donation-panel";
import { 
  Award, 
  Star, 
  MapPin, 
  Users, 
  Calendar, 
  Share2, 
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const revalidate = 0; // Live fund updates

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;

  let campaign: any = null;
  try {
    campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        organization: {
          include: {
            reviews: {
              include: {
                donor: {
                  select: { name: true },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            trustScoreBreakdown: true,
          },
        },
        donations: {
          where: { status: "SUCCESS" },
          include: {
            donor: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        updates: {
          orderBy: { createdAt: "desc" },
        },
        fundUsages: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching campaign details:", error);
  }

  if (!campaign) {
    notFound();
  }

  const percentFunded = Math.min(
    100,
    Math.round((campaign.raisedAmount / campaign.goalAmount) * 100)
  );

  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(campaign.endDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  // Parse JSON storage columns safely
  let budgetPlanList = [];
  try {
    budgetPlanList = JSON.parse(campaign.usagePlan || "[]");
  } catch (e) {
    console.error("Error parsing usagePlan", e);
  }

  let galleryList = [];
  try {
    galleryList = JSON.parse(campaign.gallery || "[]");
  } catch (e) {
    console.error("Error parsing gallery", e);
  }

  const getTierDetails = (tier: string) => {
    switch (tier) {
      case "GOLD":
        return "text-amber-400 bg-amber-500/10 border-amber-500/25";
      case "SILVER":
        return "text-slate-355 bg-slate-400/10 border-slate-400/25";
      case "BRONZE":
      default:
        return "text-orange-400 bg-orange-500/10 border-orange-500/25";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back button */}
      <Link 
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Campaigns
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* LEFT COLUMN: Main Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-900 border border-slate-800 text-primary px-3 py-1 rounded-md">
                {campaign.category}
              </span>
              <span className={cn(
                "inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold border px-2.5 py-1 rounded-md",
                getTierDetails(campaign.organization.verificationTier)
              )}>
                <Award className="h-3.5 w-3.5" /> {campaign.organization.verificationTier} VERIFIED
              </span>
              {campaign.isUrgent && (
                <span className="text-[10px] uppercase tracking-wider font-bold bg-rose-500 text-white px-2.5 py-1 rounded-md animate-pulse">
                  Urgent Need
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              {campaign.title}
            </h1>
            
            {/* Host NGO profile header */}
            <div className="flex justify-between items-center gap-4 mt-4 py-3 border-t border-b border-slate-900/60 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center p-0.5 text-slate-400 font-extrabold text-sm">
                  {campaign.organization.logo ? (
                    <img src={campaign.organization.logo} alt={campaign.organization.name} className="h-full w-full object-contain rounded-md" />
                  ) : (
                    campaign.organization.name.charAt(0)
                  )}
                </div>
                <div>
                  <Link href={`/charities/${campaign.organizationId}`} className="text-xs font-bold text-white hover:text-primary transition-colors block">
                    {campaign.organization.name}
                  </Link>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-secondary" />
                    {campaign.location}
                  </span>
                </div>
              </div>

              {/* Trust Score block */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
                <Star className="h-4.5 w-4.5 text-amber-400 fill-amber-400" />
                <div>
                  <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider leading-none">Trust Score</span>
                  <span className="text-xs font-black text-white leading-none mt-1 inline-block">
                    {campaign.organization.trustScore.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Banner cover image */}
          <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative">
            <img src={campaign.coverImage} alt={campaign.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          </div>

          {/* Core metrics bar (Mobile view priority) */}
          <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-950/45 border border-slate-900">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Raised</span>
              <span className="text-base sm:text-lg font-black text-gradient block mt-1">
                ${campaign.raisedAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-center border-l border-r border-slate-900">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Goal</span>
              <span className="text-base sm:text-lg font-black text-slate-300 block mt-1">
                ${campaign.goalAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Donors</span>
              <span className="text-base sm:text-lg font-black text-secondary block mt-1">
                {campaign.totalDonors}
              </span>
            </div>
          </div>

          {/* Interactive tabs */}
          <CampaignTabs
            story={campaign.story}
            budgetPlan={budgetPlanList}
            fundUsages={campaign.fundUsages}
            updates={campaign.updates}
            donors={campaign.donations.map((d: any) => ({
              id: d.id,
              amount: d.amount,
              isAnonymous: d.isAnonymous,
              donorName: d.isAnonymous ? null : (d.donor?.name || d.donorName),
              message: d.message,
              createdAt: d.createdAt,
            }))}
            reviews={campaign.organization.reviews.map((r: any) => ({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              isVerifiedDonor: r.isVerifiedDonor,
              createdAt: r.createdAt,
              donor: { name: r.donor.name },
            }))}
            beneficiaryCount={campaign.beneficiaryCount}
            location={campaign.location}
          />
        </div>

        {/* RIGHT COLUMN: Sidebar (Donation Panel & Sharing) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Donation Action Panel */}
          {campaign.status === "ACTIVE" ? (
            <DonationPanel campaignId={campaign.id} campaignTitle={campaign.title} />
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 text-center shadow-xl space-y-3">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">Campaign Inactive</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This campaign is marked as {campaign.status.toLowerCase()} and is no longer accepting public contributions.
              </p>
              <Link 
                href="/campaigns"
                className="w-full text-center text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl block border border-slate-700 mt-2"
              >
                Browse Active Campaigns
              </Link>
            </div>
          )}

          {/* Social share panel */}
          <div className="bg-slate-950/45 border border-slate-900 rounded-2xl p-5 space-y-3.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Share Campaign</span>
            <div className="grid grid-cols-3 gap-2">
              <button className="py-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white transition-all border border-slate-850">
                Twitter
              </button>
              <button className="py-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white transition-all border border-slate-850">
                Facebook
              </button>
              <button className="py-2 bg-slate-900 hover:bg-slate-850 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white transition-all border border-slate-850">
                Copy Link
              </button>
            </div>
          </div>

          {/* Report campaign trigger */}
          <Link 
            href={`/campaigns/${campaign.id}/report`}
            className="w-full py-2.5 bg-slate-950/25 border border-slate-900 hover:border-rose-500/20 hover:bg-rose-500/5 text-rose-400 hover:text-rose-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <AlertTriangle className="h-4 w-4" /> Report this campaign
          </Link>
        </div>

      </div>
    </div>
  );
}
