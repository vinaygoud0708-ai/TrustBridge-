import Link from "next/link";
import { Star, Award, Heart, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CharityCardProps {
  charity: {
    id: string;
    name: string;
    description: string;
    logo: string | null;
    verificationTier: string;
    trustScore: number;
    totalRaised: number;
    totalCampaigns: number;
    completedCampaigns: number;
    city: string;
    country: string;
  };
}

export default function CharityCard({ charity }: CharityCardProps) {
  const getTierDetails = (tier: string) => {
    switch (tier) {
      case "GOLD":
        return {
          label: "Gold Verified",
          classes: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        };
      case "SILVER":
        return {
          label: "Silver Verified",
          classes: "text-slate-300 bg-slate-400/10 border-slate-400/30",
        };
      case "BRONZE":
      default:
        return {
          label: "Bronze Verified",
          classes: "text-orange-400 bg-orange-500/10 border-orange-500/30",
        };
    }
  };

  const tier = getTierDetails(charity.verificationTier);

  return (
    <div className="group rounded-2xl glass-card p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-slate-700/60">
      {/* Header Info */}
      <div className="flex gap-4 items-start">
        {/* NGO Logo */}
        <div className="h-16 w-16 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
          {charity.logo ? (
            <img src={charity.logo} alt={charity.name} className="h-full w-full object-contain rounded-lg" />
          ) : (
            <ShieldCheck className="h-8 w-8 text-primary" />
          )}
        </div>

        {/* Name and Location */}
        <div className="min-w-0">
          <Link href={`/charities/${charity.id}`} className="block group-hover:text-primary transition-colors">
            <h3 className="font-bold text-base text-white leading-tight truncate">
              {charity.name}
            </h3>
          </Link>
          <span className="text-xs text-slate-400 block mt-1">
            {charity.city}, {charity.country}
          </span>
          <span className={cn(
            "inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold border px-2 py-0.5 rounded-md mt-2",
            tier.classes
          )}>
            <Award className="h-3 w-3" /> {tier.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 mt-4 leading-relaxed line-clamp-3">
        {charity.description}
      </p>

      {/* Trust Score & Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-800/40 bg-slate-900/10 rounded-xl p-3">
        {/* Trust Score */}
        <div className="flex flex-col gap-1 items-center justify-center border-r border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Trust Score</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Star className="h-4.5 w-4.5 text-amber-400 fill-amber-400" />
            <span className="text-sm font-bold text-white">{charity.trustScore.toFixed(1)}/5.0</span>
          </div>
        </div>

        {/* Total Raised */}
        <div className="flex flex-col gap-1 items-center justify-center">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Raised</span>
          <span className="text-sm font-bold text-emerald-400 mt-0.5">
            ${charity.totalRaised.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tiny Stats */}
      <div className="flex justify-between items-center text-[11px] text-slate-500 mt-4 px-1">
        <span className="flex items-center gap-1">
          <Heart className="h-3.5 w-3.5 text-primary" />
          {charity.totalCampaigns} campaigns
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
          {charity.completedCampaigns} completed
        </span>
      </div>

      {/* Action CTA */}
      <Link
        href={`/charities/${charity.id}`}
        className="w-full text-center text-xs font-bold text-white bg-slate-800 hover:bg-gradient-to-r hover:from-primary hover:to-secondary transition-all py-2.5 rounded-xl mt-5 border border-slate-700/60 block"
      >
        View Charity Profile
      </Link>
    </div>
  );
}
