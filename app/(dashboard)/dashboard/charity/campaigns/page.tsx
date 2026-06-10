import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Eye, 
  TrendingUp, 
  FileText,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function CampaignsManagerPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.orgId) {
    redirect("/login");
  }

  const org = await prisma.organization.findUnique({
    where: { id: session.user.orgId },
    include: {
      campaigns: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!org) {
    redirect("/register/charity");
  }

  const campaigns = org.campaigns;

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === "ACTIVE").length;
  const pendingCampaigns = campaigns.filter(c => c.status === "PENDING").length;
  const completedCampaigns = campaigns.filter(c => c.status === "COMPLETED").length;

  return (
    <div className="space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">My Campaigns</h1>
          <p className="text-xs text-slate-400 mt-1">Manage details, track performance, and report fund usage updates.</p>
        </div>
        <Link
          href="/dashboard/charity/campaigns/new"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> New Campaign
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-905 border border-slate-800 rounded-2xl">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total</span>
          <span className="text-lg font-black text-white mt-1 block">{totalCampaigns}</span>
        </div>
        <div className="p-4 bg-slate-905 border border-slate-800 rounded-2xl">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active</span>
          <span className="text-lg font-black text-emerald-400 mt-1 block">{activeCampaigns}</span>
        </div>
        <div className="p-4 bg-slate-905 border border-slate-800 rounded-2xl">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pending Approval</span>
          <span className="text-lg font-black text-amber-400 mt-1 block">{pendingCampaigns}</span>
        </div>
        <div className="p-4 bg-slate-905 border border-slate-800 rounded-2xl">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Completed</span>
          <span className="text-lg font-black text-primary mt-1 block">{completedCampaigns}</span>
        </div>
      </div>

      {/* Campaign List Grid */}
      {campaigns.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/10 border border-dashed border-slate-800 rounded-3xl">
          <HelpCircle className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-white text-sm">No Campaigns Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Create itemized campaigns to list on our public transparent charity interface.</p>
          <Link
            href="/dashboard/charity/campaigns/new"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md"
          >
            <Plus className="h-4 w-4" /> Start First Campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((c) => {
            const percent = Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100));
            const formattedStart = new Date(c.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const formattedEnd = new Date(c.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

            return (
              <div 
                key={c.id} 
                className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  {/* Image and status cover */}
                  <div className="relative h-44 w-full bg-slate-950">
                    <img
                      src={c.coverImage}
                      alt={c.title}
                      className="object-cover h-full w-full opacity-80 group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute top-4 left-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold border",
                        c.status === "ACTIVE" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                        c.status === "DRAFT" && "bg-slate-800 text-slate-400 border-slate-700",
                        c.status === "PENDING" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                        c.status === "COMPLETED" && "bg-primary/10 text-primary border-primary/20",
                        c.status === "REJECTED" && "bg-rose-500/10 text-rose-500 border-rose-500/20",
                        c.status === "CLOSED" && "bg-slate-900 text-slate-500 border-slate-800"
                      )}>
                        {c.status}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{c.category}</span>
                      <h3 className="font-extrabold text-sm text-white truncate mt-0.5">{c.title}</h3>
                    </div>
                  </div>

                  {/* Body content */}
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{c.description}</p>
                    
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 font-bold">FUNDING PROGRESS</span>
                        <span className="text-white font-extrabold">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-emerald-400">${c.raisedAmount.toLocaleString()}</span>
                        <span className="text-slate-450">target of ${c.goalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Metadata fields */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-850/50 text-[10px] text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{c.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formattedStart} - {formattedEnd}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="px-5 pb-5 pt-3 bg-slate-900/20 border-t border-slate-850/30 grid grid-cols-3 gap-2">
                  <Link
                    href={`/campaigns/${c.id}`}
                    className="py-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800/40 text-center transition-all inline-flex items-center justify-center gap-1"
                  >
                    <Eye className="h-3 w-3" /> View Live
                  </Link>
                  <Link
                    href={`/dashboard/charity/campaigns/${c.id}/update`}
                    className="py-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800/40 text-center transition-all inline-flex items-center justify-center gap-1"
                  >
                    <FileText className="h-3 w-3 text-primary" /> Update
                  </Link>
                  <Link
                    href={`/dashboard/charity/campaigns/${c.id}/analytics`}
                    className="py-2 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary hover:bg-primary hover:text-white text-center transition-all inline-flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="h-3 w-3" /> Analytics
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
