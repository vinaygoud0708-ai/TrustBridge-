"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Megaphone, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Star,
  Flame,
  Bookmark
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetItem {
  item: string;
  amount: number;
}

interface CampaignItem {
  id: string;
  title: string;
  description: string;
  story: string;
  goalAmount: number;
  raisedAmount: number;
  category: string;
  status: string;
  coverImage: string;
  location: string;
  isUrgent: boolean;
  isFeatured: boolean;
  usagePlan: string; // JSON array string
  adminNote: string | null;
  organization: {
    name: string;
    verificationTier: string;
  };
}

interface CampaignApprovalDashboardProps {
  campaigns: CampaignItem[];
}

export default function CampaignApprovalDashboard({ campaigns }: CampaignApprovalDashboardProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const campaign = campaigns.find(c => c.id === selectedId);

  // Parse budget plan
  let budgetList: BudgetItem[] = [];
  if (campaign) {
    try {
      budgetList = JSON.parse(campaign.usagePlan) || [];
    } catch {
      budgetList = [];
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selectedId,
          status,
          isFeatured,
          isUrgent,
          adminNote,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update campaign");
      }

      setSuccess("Campaign credentials updated successfully.");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      
      {/* Campaign selection list (Col Span 4) */}
      <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-2xl h-fit space-y-4">
        <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2">
          Campaign Applications
        </h3>

        {campaigns.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-855 rounded-2xl">
            <span className="text-xs text-slate-500 italic">No campaigns registered.</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {campaigns.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedId(c.id);
                  setStatus(c.status);
                  setIsFeatured(c.isFeatured);
                  setIsUrgent(c.isUrgent);
                  setAdminNote(c.adminNote || "");
                  setError("");
                  setSuccess("");
                }}
                className={cn(
                  "w-full p-4 rounded-2xl border transition-all text-left block space-y-2",
                  selectedId === c.id
                    ? "bg-primary/10 border-primary text-white"
                    : "bg-slate-905 border-slate-850 hover:bg-slate-800/30 text-slate-350"
                )}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs truncate max-w-[130px]">{c.title}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-extrabold",
                    c.status === "ACTIVE" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                    c.status === "PENDING" && "bg-amber-500/10 text-amber-450 border border-amber-500/20",
                    c.status === "DRAFT" && "bg-slate-805 text-slate-400 border border-slate-700",
                    c.status === "COMPLETED" && "bg-primary/10 text-primary border border-primary/20",
                    c.status === "REJECTED" && "bg-rose-500/10 text-rose-550 border border-rose-500/20"
                  )}>
                    {c.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-medium">
                  <span>NGO: {c.organization.name}</span>
                  <span>Goal: ${c.goalAmount.toLocaleString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details & Actions Panel (Col Span 8) */}
      <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {!campaign ? (
          <div className="py-20 text-center border border-dashed border-slate-850 rounded-2xl flex flex-col justify-center items-center">
            <Megaphone className="h-8 w-8 text-slate-650 mb-3" />
            <span className="text-xs text-slate-500 italic">Select a campaign application to review, audit budget allocations, and change active status.</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header / Cover */}
            <div className="relative h-48 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-850">
              <img 
                src={campaign.coverImage} 
                alt={campaign.title} 
                className="object-cover h-full w-full opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{campaign.category} • {campaign.location}</span>
                <h2 className="text-base font-black text-white mt-1 leading-snug">{campaign.title}</h2>
                <span className="text-[10px] text-slate-400 block mt-1.5 font-semibold">Organized by {campaign.organization.name} ({campaign.organization.verificationTier} NGO)</span>
              </div>
            </div>

            {/* Stories details */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">Campaign Summary</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{campaign.description}</p>
            </div>

            {/* Itemized Budget allocations */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-emerald-450" /> Budget Allocation Checklist
              </h4>

              {budgetList.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-slate-850 rounded-xl">
                  <span className="text-xs text-slate-550 italic">No itemized budget list declared.</span>
                </div>
              ) : (
                <div className="space-y-2 border border-slate-850 rounded-2xl p-4 bg-slate-950/40">
                  {budgetList.map((b, index) => (
                    <div 
                      key={index}
                      className="flex justify-between items-center text-xs pb-2 border-b border-slate-850/50 last:border-0 last:pb-0"
                    >
                      <span className="text-slate-300 font-medium">{b.item}</span>
                      <span className="font-bold text-white">${b.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-xs font-bold pt-3 border-t border-slate-850">
                    <span className="text-slate-450 uppercase">Total Budget Allocated:</span>
                    <span className="text-emerald-450 text-sm">${budgetList.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Verification Form options */}
            <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-slate-850">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">Administrative Actions</h4>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-455 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold">Campaign Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="PENDING">PENDING - Under Review</option>
                    <option value="ACTIVE">ACTIVE - Live Donation Panel</option>
                    <option value="COMPLETED">COMPLETED - Funding Achieved</option>
                    <option value="REJECTED">REJECTED - Form Rejected</option>
                    <option value="CLOSED">CLOSED - Campaign Frozen</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={() => setIsFeatured(!isFeatured)}
                    className={cn(
                      "w-full py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                      isFeatured 
                        ? "bg-amber-500/15 border-amber-500 text-amber-300" 
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:text-white"
                    )}
                  >
                    <Star className="h-4 w-4" /> {isFeatured ? "Featured Campaign" : "Feature Campaign"}
                  </button>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={() => setIsUrgent(!isUrgent)}
                    className={cn(
                      "w-full py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                      isUrgent 
                        ? "bg-rose-500/15 border-rose-500 text-rose-300" 
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:text-white"
                    )}
                  >
                    <Flame className="h-4 w-4" /> {isUrgent ? "Urgent Priority" : "Flag as Urgent"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold">Administrative Note (Audit trails)</label>
                <input
                  type="text"
                  placeholder="e.g. Approved. Budget allocation lists verified against registration categories."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="h-4.5 w-4.5" />
                {loading ? "Saving changes..." : "Commit Campaign Status Decisions"}
              </button>
            </form>

          </div>
        )}
      </div>

    </div>
  );
}
