"use client";

import { useState } from "react";
import { 
  Heart, 
  CheckCircle2, 
  FileCheck2, 
  MessageSquare, 
  Star,
  Award,
  ExternalLink,
  Calendar
} from "lucide-react";
import CampaignCard from "@/components/campaigns/campaign-card";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CampaignItem {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  coverImage: string;
  endDate: string | Date;
  totalDonors: number;
  category: string;
  status: string;
  isUrgent: boolean;
  organization: {
    name: string;
    verificationTier: string;
    trustScore: number;
  };
}

interface FundUsageItem {
  id: string;
  item: string;
  description: string;
  amount: number;
  proofType: string;
  proofFileUrl: string;
  status: string;
  uploadedAt: string | Date;
  campaign: {
    title: string;
    id: string;
  };
}

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  isVerifiedDonor: boolean;
  createdAt: string | Date;
  donor: {
    name: string;
  };
}

interface CharityTabsProps {
  activeCampaigns: CampaignItem[];
  completedCampaigns: CampaignItem[];
  fundUsages: FundUsageItem[];
  reviews: ReviewItem[];
}

export default function CharityTabs({
  activeCampaigns,
  completedCampaigns,
  fundUsages,
  reviews,
}: CharityTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("campaigns");

  const tabs = [
    { id: "campaigns", name: "Campaigns", icon: Heart },
    { id: "ledger", name: "Public Fund Ledger", icon: FileCheck2 },
    { id: "reviews", name: "Reviews", icon: MessageSquare },
  ];

  return (
    <div className="w-full">
      {/* Tabs list */}
      <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-none gap-2 pb-px mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                isActive
                  ? "border-primary text-primary bg-primary/5 rounded-t-lg"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
              {tab.id === "campaigns" && (
                <span className="bg-primary/15 text-primary text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {activeCampaigns.length + completedCampaigns.length}
                </span>
              )}
              {tab.id === "ledger" && fundUsages.length > 0 && (
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  {fundUsages.length} proof
                </span>
              )}
              {tab.id === "reviews" && reviews.length > 0 && (
                <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded-full">
                  {reviews.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in-up">
        
        {/* CAMPAIGNS TAB */}
        {activeTab === "campaigns" && (
          <div className="space-y-10">
            {/* Active Campaigns */}
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" /> Active Fundraising Campaigns ({activeCampaigns.length})
              </h3>
              {activeCampaigns.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-850 rounded-2xl text-slate-500 text-xs">
                  No active fundraising campaigns at the moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeCampaigns.map((camp) => (
                    <CampaignCard key={camp.id} campaign={camp} />
                  ))}
                </div>
              )}
            </div>

            {/* Completed Campaigns */}
            <div className="pt-6 border-t border-slate-900/60">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Completed Campaigns ({completedCampaigns.length})
              </h3>
              {completedCampaigns.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-850 rounded-2xl text-slate-500 text-xs">
                  No completed campaigns archived yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedCampaigns.map((camp) => (
                    <CampaignCard key={camp.id} campaign={camp} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* LEDGER TAB */}
        {activeTab === "ledger" && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Public Expense Ledger</h3>
            <p className="text-xs text-slate-400 leading-normal mb-4">
              All financial disbursements received by this organization from escrow ledgers, alongside host verified receipt uploads.
            </p>

            {fundUsages.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-850 rounded-2xl flex flex-col items-center gap-2 p-6">
                <FileCheck2 className="h-8 w-8 text-slate-700" />
                <span className="text-xs text-slate-400 font-bold">No ledger logs verified yet</span>
                <p className="text-[11px] text-slate-500 max-w-sm">Expenses and invoices will appear here as campaigns start utilizing funds.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>Campaign Project</th>
                      <th>Disbursement Item</th>
                      <th>Category</th>
                      <th>Spent Amount</th>
                      <th>Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundUsages.map((usage) => (
                      <tr key={usage.id}>
                        <td>
                          <Link href={`/campaigns/${usage.campaign.id}`} className="font-bold text-primary hover:underline block text-xs">
                            {usage.campaign.title}
                          </Link>
                        </td>
                        <td>
                          <span className="font-semibold text-white block">{usage.item}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{usage.description}</span>
                        </td>
                        <td className="text-slate-300 text-[11px] font-semibold">{usage.proofType}</td>
                        <td className="font-extrabold text-emerald-400">${usage.amount.toLocaleString()}</td>
                        <td>
                          <a
                            href={usage.proofFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:text-secondary font-bold hover:underline"
                          >
                            Receipt <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Donor Feedback & Ratings</h3>

            {reviews.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-855 rounded-2xl p-6">
                <span className="text-xs text-slate-500">No donor reviews submitted for this organization yet.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-5 rounded-2xl bg-slate-900/35 border border-slate-800 flex flex-col gap-2.5">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{rev.donor.name}</span>
                        {rev.isVerifiedDonor && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-0.5">
                            <Award className="h-3 w-3" /> Verified Donor
                          </span>
                        )}
                      </div>
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "h-3.5 w-3.5",
                              i < rev.rating ? "fill-amber-400" : "text-slate-600"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">"{rev.comment}"</p>
                    <span className="text-[9px] text-slate-500 self-end">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
