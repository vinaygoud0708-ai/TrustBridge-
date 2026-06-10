import Link from "next/link";
import { Calendar, Users, Star, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    goalAmount: number;
    raisedAmount: number;
    coverImage: string;
    endDate: string | Date;
    totalDonors: number;
    category: string;
    isUrgent?: boolean;
    organization: {
      name: string;
      verificationTier: string;
      trustScore: number;
    };
  };
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "GOLD":
        return "text-amber-400 bg-amber-500/10 border-amber-500/35";
      case "SILVER":
        return "text-slate-300 bg-slate-400/10 border-slate-400/35";
      case "BRONZE":
      default:
        return "text-orange-400 bg-orange-500/10 border-orange-500/35";
    }
  };

  return (
    <div className={cn(
      "group relative flex flex-col rounded-2xl glass-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-slate-700/60",
      campaign.isUrgent && "border-rose-500/30 shadow-md shadow-rose-950/20"
    )}>
      {/* Cover Image & Category Badge */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-900/80 backdrop-blur-md text-primary px-2.5 py-1 rounded-md border border-slate-700">
            {campaign.category}
          </span>
          {campaign.isUrgent && (
            <span className="text-[10px] uppercase tracking-wider font-bold bg-rose-500 text-white px-2.5 py-1 rounded-md animate-pulse">
              Urgent
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        {/* NGO Info & Trust Score */}
        <div className="flex justify-between items-center gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-slate-300 truncate">
              {campaign.organization.name}
            </span>
            <span className={cn(
              "p-0.5 rounded-full border flex items-center justify-center flex-shrink-0",
              getTierColor(campaign.organization.verificationTier)
            )}>
              <Award className="h-3 w-3" />
            </span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10 flex-shrink-0">
            <Star className="h-3 w-3 fill-amber-400" />
            <span className="text-xs font-bold">{campaign.organization.trustScore.toFixed(1)}</span>
          </div>
        </div>

        {/* Campaign Title */}
        <Link href={`/campaigns/${campaign.id}`} className="block group-hover:text-primary transition-colors">
          <h3 className="font-bold text-base text-white leading-snug line-clamp-2 min-h-[44px]">
            {campaign.title}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {campaign.description}
        </p>

        {/* Progress Section */}
        <div className="mt-auto pt-4">
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-300">${campaign.raisedAmount.toLocaleString()} raised</span>
            <span className="text-primary">{percentFunded}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full progress-fill"
              style={{ width: `${percentFunded}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
            <span>Goal: ${campaign.goalAmount.toLocaleString()}</span>
            <span>{campaign.totalDonors} donors</span>
          </div>
        </div>
      </div>

      {/* Card Footer (CTA Link) */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-800/40 bg-slate-900/10 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <Calendar className="h-3.5 w-3.5 text-secondary" />
          {daysRemaining > 0 ? `${daysRemaining} days left` : "Ended"}
        </span>
        <Link
          href={`/campaigns/${campaign.id}`}
          className="text-xs font-bold text-white bg-slate-800 hover:bg-primary hover:text-white px-4 py-2 rounded-xl transition-all border border-slate-700/60"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
