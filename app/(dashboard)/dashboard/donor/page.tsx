import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  Heart, 
  Award, 
  History, 
  ArrowUpRight, 
  FileDown, 
  Bell, 
  CheckCircle,
  ExternalLink,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export const revalidate = 0; // Live calculations

export default async function DonorDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  // 1. Fetch user donations
  const donations = await prisma.donation.findMany({
    where: { donorId: session.user.id, status: "SUCCESS" },
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          status: true,
          goalAmount: true,
          raisedAmount: true,
          coverImage: true,
          organization: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate lifetime donation sum
  const totalDonated = donations.reduce((acc, d) => acc + d.amount, 0);

  // Group by unique campaigns
  const campaignsMap = new Map();
  donations.forEach((d) => {
    campaignsMap.set(d.campaign.id, d.campaign);
  });
  const supportedCampaigns = Array.from(campaignsMap.values());

  const activeCampaignsSupported = supportedCampaigns.filter((c) => c.status === "ACTIVE").length;
  const completedCampaignsSupported = supportedCampaigns.filter((c) => c.status === "COMPLETED").length;
  
  // Impact points: 1 point for every $10 donated
  const impactScore = Math.floor(totalDonated / 10);

  // Get campaign IDs supported by the user
  const supportedCampaignIds = Array.from(campaignsMap.keys());

  // 2. Fetch recent fund usage proofs for backed campaigns (transparency logs feed)
  let fundUsages: any[] = [];
  if (supportedCampaignIds.length > 0) {
    try {
      fundUsages = await prisma.fundUsage.findMany({
        where: {
          campaignId: { in: supportedCampaignIds },
        },
        include: {
          campaign: {
            select: { title: true, id: true },
          },
        },
        orderBy: { uploadedAt: "desc" },
        take: 3,
      });
    } catch (err) {
      console.error("Error query fund usages for dashboard:", err);
    }
  }

  // 3. Fetch user notifications
  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8 text-left">
      
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Overview</h1>
        <p className="text-xs text-slate-450 mt-1">Check the real-time allocation status of your donations.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Donated */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-primary/5 blur-xl rounded-full" />
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Lifetime Donated</span>
          <span className="text-xl font-black text-white block mt-2">${totalDonated.toLocaleString()}</span>
        </div>

        {/* Active Campaigns Vetted */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-secondary/5 blur-xl rounded-full" />
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Active Supported</span>
          <span className="text-xl font-black text-white block mt-2">{activeCampaignsSupported} projects</span>
        </div>

        {/* Completed Projects */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 blur-xl rounded-full" />
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Completed Goals</span>
          <span className="text-xl font-black text-white block mt-2">{completedCampaignsSupported} projects</span>
        </div>

        {/* Impact Points */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 blur-xl rounded-full" />
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">My Impact Score</span>
          <span className="text-xl font-black text-amber-400 block mt-2 flex items-center gap-1.5">
            <Award className="h-5 w-5 text-amber-400 fill-amber-400/10" /> {impactScore} pts
          </span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Recent Donations & Backed Projects */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Backed Projects progress list */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <Heart className="h-4.5 w-4.5 text-primary" /> Supported Projects
            </h3>

            {supportedCampaigns.length === 0 ? (
              <div className="text-center py-8 text-slate-550 text-xs">
                You haven't supported any campaign yet. <Link href="/campaigns" className="text-primary hover:underline font-bold">Find a campaign</Link>.
              </div>
            ) : (
              <div className="space-y-4">
                {supportedCampaigns.slice(0, 3).map((camp) => {
                  const percent = Math.min(100, Math.round((camp.raisedAmount / camp.goalAmount) * 100));
                  return (
                    <div key={camp.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-850">
                        <img src={camp.coverImage} alt={camp.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <Link href={`/campaigns/${camp.id}`} className="text-xs font-bold text-white hover:text-primary transition-colors block truncate">
                          {camp.title}
                        </Link>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{camp.organization.name}</span>
                        {/* Progress */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-300 whitespace-nowrap">{percent}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Donations Table */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-4.5 w-4.5 text-secondary" /> Recent Contributions
              </h3>
              <Link href="/dashboard/donor/donations" className="text-xs font-bold text-primary hover:text-secondary transition-colors">
                View History →
              </Link>
            </div>

            {donations.length === 0 ? (
              <div className="text-center py-6 text-slate-550 text-xs">
                No recent transactions processed.
              </div>
            ) : (
              <div className="table-wrap">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.slice(0, 4).map((d) => (
                      <tr key={d.id}>
                        <td>
                          <Link href={`/campaigns/${d.campaignId}`} className="font-bold text-slate-200 hover:text-primary transition-colors block text-xs">
                            {d.campaign.title}
                          </Link>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {new Date(d.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="font-extrabold text-emerald-400 text-xs">
                          ${d.amount.toLocaleString()}
                        </td>
                        <td>
                          <span className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                            d.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-danger/10 text-danger border-danger/20"
                          )}>
                            {d.status}
                          </span>
                        </td>
                        <td>
                          {d.status === "SUCCESS" && (
                            <a
                              href={d.receiptUrl || `/api/donations/${d.id}/receipt`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-secondary hover:underline"
                            >
                              PDF <FileDown className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Fund usage feed & notifications */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Transparency feed */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-md relative overflow-hidden">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" /> Transparency Audit Feed
            </h3>

            {fundUsages.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                No verified expenditures filed yet on supported campaigns.
              </div>
            ) : (
              <div className="space-y-4">
                {fundUsages.map((usage) => (
                  <div key={usage.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2 text-left">
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                      Spent: ${usage.amount.toLocaleString()}
                    </span>
                    <p className="text-xs font-bold text-slate-200 line-clamp-1 leading-snug">{usage.item}</p>
                    <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed">{usage.description}</p>
                    <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[9px] text-slate-500 font-semibold">
                      <span className="truncate max-w-[120px]">{usage.campaign.title}</span>
                      <a
                        href={usage.proofFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-secondary hover:underline flex items-center gap-0.5"
                      >
                        Receipt <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* In-app Notification lists */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-md relative overflow-hidden">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-primary" /> Alerts & Updates
            </h3>

            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-550 text-xs">
                No active notifications.
              </div>
            ) : (
              <div className="space-y-3.5">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={cn(
                      "p-3 rounded-xl border text-left space-y-1 transition-colors",
                      notif.isRead 
                        ? "bg-slate-950/20 border-slate-900 text-slate-400" 
                        : "bg-primary/5 border-primary/15 text-slate-200"
                    )}
                  >
                    <span className="text-[10px] font-bold block text-white leading-tight">{notif.title}</span>
                    <p className="text-[10px] text-slate-450 leading-relaxed">{notif.message}</p>
                    <span className="text-[8px] text-slate-550 block pt-1">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
