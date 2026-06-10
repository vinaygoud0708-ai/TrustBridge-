import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import CharityTabs from "@/components/charity/charity-tabs";
import { 
  Award, 
  Star, 
  MapPin, 
  Users, 
  Globe, 
  Heart, 
  CheckCircle,
  FileCheck,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const revalidate = 0; // Live trust score recalculations

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CharityDetailPage({ params }: PageProps) {
  const { id } = await params;

  let charity: any = null;
  try {
    charity = await prisma.organization.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true },
        },
        trustScoreBreakdown: true,
        campaigns: {
          include: {
            organization: {
              select: {
                name: true,
                verificationTier: true,
                trustScore: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          include: {
            donor: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching charity profile details:", error);
  }

  if (!charity) {
    notFound();
  }

  // Split campaigns
  const activeCampaigns = charity.campaigns.filter((c: any) => c.status === "ACTIVE");
  const completedCampaigns = charity.campaigns.filter((c: any) => c.status === "COMPLETED");

  // Fetch fund usages across all campaigns of this organization
  let fundUsages: any[] = [];
  try {
    fundUsages = await prisma.fundUsage.findMany({
      where: {
        campaign: {
          organizationId: charity.id,
        },
      },
      include: {
        campaign: {
          select: { title: true, id: true },
        },
      },
      orderBy: { uploadedAt: "desc" },
    });
  } catch (err) {
    console.error("Error query fund usages for organization:", err);
  }

  // Calculate unique donors count
  let donorsCount = 0;
  try {
    const uniqueDonors = await prisma.donation.groupBy({
      by: ["donorEmail"],
      where: {
        campaign: {
          organizationId: charity.id,
        },
        status: "SUCCESS",
      },
    });
    donorsCount = uniqueDonors.length;
  } catch (e) {
    console.error(e);
  }

  // Calculate years active
  const yearsActive = Math.max(
    1,
    new Date().getFullYear() - new Date(charity.createdAt).getFullYear()
  );

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "GOLD":
        return "text-amber-400 bg-amber-500/10 border-amber-500/25";
      case "SILVER":
        return "text-slate-300 bg-slate-400/10 border-slate-400/25";
      case "BRONZE":
      default:
        return "text-orange-400 bg-orange-500/10 border-orange-500/25";
    }
  };

  const score = charity.trustScoreBreakdown || {
    verificationScore: 10,
    reportingScore: 25,
    donorRatingScore: 20,
    completionScore: 15,
    complaintScore: 10,
    totalScore: 80,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back link */}
      <Link 
        href="/charities"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to NGOs Directory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* LEFT COLUMN: Profile info, key metrics, and tabs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Info Box */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl rounded-full" />
            
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Logo */}
              <div className="h-20 w-20 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center p-1 shadow-lg">
                {charity.logo ? (
                  <img src={charity.logo} alt={charity.name} className="h-full w-full object-contain rounded-xl" />
                ) : (
                  <Award className="h-10 w-10 text-primary" />
                )}
              </div>

              {/* Text metadata */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-white leading-none tracking-tight">
                    {charity.name}
                  </h1>
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold border px-2.5 py-0.5 rounded-md",
                    getTierColor(charity.verificationTier)
                  )}>
                    <Award className="h-3.5 w-3.5" /> {charity.verificationTier} TIER PARTNER
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-secondary" /> {charity.city}, {charity.country}
                  </span>
                  {charity.website && (
                    <a href={charity.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline font-semibold">
                      <Globe className="h-3.5 w-3.5" /> Website
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-350 leading-relaxed pt-2">
                  {charity.description}
                </p>
              </div>
            </div>

            {/* Key stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-850 text-center">
              <div className="p-3 bg-slate-950/25 border border-slate-850 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Raised</span>
                <span className="text-base font-black text-white mt-1 block">${charity.totalRaised.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-950/25 border border-slate-850 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Active projects</span>
                <span className="text-base font-black text-white mt-1 block">{activeCampaigns.length}</span>
              </div>
              <div className="p-3 bg-slate-950/25 border border-slate-850 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Verified Donors</span>
                <span className="text-base font-black text-white mt-1 block">{donorsCount}</span>
              </div>
              <div className="p-3 bg-slate-950/25 border border-slate-850 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Years Vetted</span>
                <span className="text-base font-black text-white mt-1 block">{yearsActive} yr</span>
              </div>
            </div>
          </div>

          {/* Charity Profile Tabs */}
          <CharityTabs
            activeCampaigns={activeCampaigns}
            completedCampaigns={completedCampaigns}
            fundUsages={fundUsages}
            reviews={charity.reviews}
          />
        </div>

        {/* RIGHT COLUMN: Sidebar (Trust breakdown & admin contacts) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Trust score panel */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 blur-2xl rounded-full" />
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-black uppercase text-white tracking-wider">Score Breakdown</span>
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-xl">
                <Star className="h-4.5 w-4.5 fill-amber-400" />
                <span className="text-sm font-black">{charity.trustScore.toFixed(1)}/5.0</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-350 mb-1.5">
                  <span>Verification Quality</span>
                  <span>{score.verificationScore} / 30</span>
                </div>
                <div className="w-full h-1 bg-slate-950 rounded-full">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(score.verificationScore / 30) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-355 mb-1.5">
                  <span>Invoice Upload Accuracy</span>
                  <span>{score.reportingScore} / 25</span>
                </div>
                <div className="w-full h-1 bg-slate-950 rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(score.reportingScore / 25) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-355 mb-1.5">
                  <span>Donor Review Rating</span>
                  <span>{score.donorRatingScore} / 20</span>
                </div>
                <div className="w-full h-1 bg-slate-950 rounded-full">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${(score.donorRatingScore / 20) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-355 mb-1.5">
                  <span>Campaign Success Rate</span>
                  <span>{score.completionScore} / 15</span>
                </div>
                <div className="w-full h-1 bg-slate-950 rounded-full">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(score.completionScore / 15) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-355 mb-1.5">
                  <span>Complaint History Index</span>
                  <span>{score.complaintScore} / 10</span>
                </div>
                <div className="w-full h-1 bg-slate-950 rounded-full">
                  <div className="h-full bg-teal-400 rounded-full" style={{ width: `${(score.complaintScore / 10) * 100}%` }} />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-850 flex justify-between items-center text-[11px] text-slate-500 font-medium">
                <span>Calculated Total Index</span>
                <span className="font-extrabold text-white">{score.totalScore} / 100</span>
              </div>
            </div>
          </div>

          {/* Contact NGO detail card */}
          <div className="bg-slate-950/45 border border-slate-900 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">NGO Contacts</span>
            <div className="text-xs space-y-2">
              <div>
                <span className="text-slate-500 block">Registration Authority</span>
                <span className="text-slate-300 font-semibold mt-0.5 block">{charity.registrationNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tax Exemption ID</span>
                <span className="text-slate-300 font-semibold mt-0.5 block">{charity.taxId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Chief Administrator</span>
                <span className="text-slate-300 font-semibold mt-0.5 block">{charity.user.name}</span>
              </div>
            </div>
          </div>

          {/* Report organization trigger */}
          <button className="w-full py-2.5 bg-slate-950/25 border border-slate-900 hover:border-rose-500/20 hover:bg-rose-500/5 text-rose-400 hover:text-rose-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Report this organization
          </button>
        </div>

      </div>
    </div>
  );
}
