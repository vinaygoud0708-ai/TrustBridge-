"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Table, 
  FileCheck2, 
  History, 
  Users, 
  MessageSquare, 
  Calendar, 
  ArrowRight,
  ExternalLink,
  Award,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetPlanItem {
  item: string;
  amount: number;
  description: string;
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
}

interface CampaignUpdateItem {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string | Date;
}

interface DonorItem {
  id: string;
  amount: number;
  isAnonymous: boolean;
  donorName: string | null;
  message: string | null;
  createdAt: string | Date;
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

interface CampaignTabsProps {
  story: string;
  budgetPlan: BudgetPlanItem[];
  fundUsages: FundUsageItem[];
  updates: CampaignUpdateItem[];
  donors: DonorItem[];
  reviews: ReviewItem[];
  beneficiaryCount: number;
  location: string;
}

export default function CampaignTabs({
  story,
  budgetPlan,
  fundUsages,
  updates,
  donors,
  reviews,
  beneficiaryCount,
  location,
}: CampaignTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("about");

  const tabs = [
    { id: "about", name: "About", icon: BookOpen },
    { id: "budget", name: "Budget Plan", icon: Table },
    { id: "usage", name: "Fund Usage", icon: FileCheck2 },
    { id: "updates", name: "Updates", icon: History },
    { id: "donors", name: "Donors", icon: Users },
    { id: "reviews", name: "Reviews", icon: MessageSquare },
  ];

  return (
    <div className="w-full">
      {/* Tab Switcher Headers */}
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
              {tab.id === "usage" && fundUsages.length > 0 && (
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  {fundUsages.length} proof
                </span>
              )}
              {tab.id === "updates" && updates.length > 0 && (
                <span className="bg-primary/15 text-primary text-[9px] px-1.5 py-0.5 rounded-full">
                  {updates.length}
                </span>
              )}
              {tab.id === "donors" && donors.length > 0 && (
                <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.5 rounded-full">
                  {donors.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="animate-fade-in-up">
        
        {/* ABOUT TAB */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4">
              <div dangerouslySetInnerHTML={{ __html: story }} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-900">
              <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Beneficiary Count</span>
                <span className="text-xl font-black text-white mt-1.5 block">
                  {beneficiaryCount.toLocaleString()} individuals
                </span>
              </div>
              <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Operational Area</span>
                <span className="text-xl font-black text-white mt-1.5 block">
                  {location}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* BUDGET TAB */}
        {activeTab === "budget" && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Estimated Project Expenses</h3>
            <div className="table-wrap">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Planned Allocation</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetPlan.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-6 text-slate-500">
                        No budget plan items declared for this campaign.
                      </td>
                    </tr>
                  ) : (
                    budgetPlan.map((item, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold text-white">{item.item}</td>
                        <td className="font-bold text-emerald-400">${item.amount.toLocaleString()}</td>
                        <td className="text-slate-400">{item.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FUND USAGE TAB */}
        {activeTab === "usage" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Escrow Disbursements & Invoices</h3>
                <p className="text-[11px] text-slate-400 mt-1">Audit trail tracking every single dollar disbursed from escrow.</p>
              </div>
            </div>

            {fundUsages.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-850 rounded-2xl flex flex-col items-center gap-2 p-6">
                <FileCheck2 className="h-8 w-8 text-slate-700" />
                <span className="text-xs text-slate-400 font-bold">No disbursements logged yet</span>
                <p className="text-[11px] text-slate-500 max-w-sm">Funds will appear here as they are approved for release and verified invoices are uploaded.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>Expense Item</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Audit Status</th>
                      <th>Evidence Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundUsages.map((usage) => (
                      <tr key={usage.id} className="hover:bg-slate-900/10 transition-colors">
                        <td>
                          <span className="font-bold text-white block">{usage.item}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{usage.description}</span>
                        </td>
                        <td className="text-slate-300 text-[11px] font-semibold">{usage.proofType}</td>
                        <td className="font-extrabold text-slate-200">${usage.amount.toLocaleString()}</td>
                        <td>
                          <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                            usage.status === "VERIFIED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          )}>
                            {usage.status}
                          </span>
                        </td>
                        <td>
                          <a
                            href={usage.proofFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:text-secondary font-bold hover:underline"
                          >
                            View Receipt <ExternalLink className="h-3.5 w-3.5" />
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

        {/* UPDATES TAB */}
        {activeTab === "updates" && (
          <div className="space-y-8">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Campaign Milestones & Updates</h3>

            {updates.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-850 rounded-2xl flex flex-col items-center gap-2 p-6">
                <History className="h-8 w-8 text-slate-700" />
                <span className="text-xs text-slate-400 font-bold">No updates posted yet</span>
                <p className="text-[11px] text-slate-500 max-w-sm">The host charity has not posted any campaign progress milestones yet.</p>
              </div>
            ) : (
              <div className="relative border-l border-slate-800 pl-6 space-y-8 ml-2">
                {updates.map((update) => (
                  <div key={update.id} className="relative">
                    {/* Bullet marker */}
                    <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border border-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>

                    <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-colors">
                      <div className="flex justify-between items-center gap-4 mb-3 flex-wrap">
                        <h4 className="font-bold text-sm text-white tracking-tight leading-snug">{update.title}</h4>
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-secondary" />
                          {new Date(update.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{update.content}</p>
                      {update.imageUrl && (
                        <div className="mt-4 rounded-xl overflow-hidden max-h-60 border border-slate-800 bg-slate-950">
                          <img src={update.imageUrl} alt={update.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DONORS TAB */}
        {activeTab === "donors" && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Donors Feed ({donors.length})</h3>

            {donors.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-855 rounded-2xl p-6">
                <span className="text-xs text-slate-500">Be the first to back this campaign! Support now to see your name here.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {donors.map((donor) => (
                  <div 
                    key={donor.id} 
                    className="p-4 rounded-2xl bg-slate-900/35 border border-slate-800/70 hover:border-slate-800 flex justify-between gap-4 items-start transition-colors"
                  >
                    <div className="flex gap-3 items-start">
                      <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-400">
                        {donor.isAnonymous ? "A" : donor.donorName?.charAt(0).toUpperCase() || "D"}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {donor.isAnonymous ? "Anonymous Donor" : donor.donorName || "Supporter"}
                        </span>
                        {donor.message && (
                          <p className="text-xs text-slate-400 mt-1 leading-snug font-medium italic">
                            "{donor.message}"
                          </p>
                        )}
                        <span className="text-[9px] text-slate-500 block mt-2">
                          {new Date(donor.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                      +${donor.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Host NGO Reviews ({reviews.length})</h3>

            {reviews.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-855 rounded-2xl p-6">
                <span className="text-xs text-slate-500">No donor reviews yet. Reviews can be filed after checking out!</span>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800 flex flex-col gap-2">
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
                    <p className="text-xs text-slate-300 leading-normal italic">"{rev.comment}"</p>
                    <span className="text-[9px] text-slate-500 self-end mt-1">
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
