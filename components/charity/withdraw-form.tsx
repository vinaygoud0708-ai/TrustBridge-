"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, Calendar, AlertCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignItem {
  id: string;
  title: string;
  raisedAmount: number;
  withdrawals: {
    requestedAmount: number;
    status: string;
  }[];
}

interface WithdrawalItem {
  id: string;
  campaign: {
    title: string;
  };
  requestedAmount: number;
  purpose: string;
  status: string;
  requestedAt: Date | string;
}

interface WithdrawFormProps {
  campaigns: CampaignItem[];
  recentWithdrawals: WithdrawalItem[];
}

export default function WithdrawForm({ campaigns, recentWithdrawals }: WithdrawFormProps) {
  const router = useRouter();
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Find selected campaign
  const campaign = campaigns.find(c => c.id === selectedCampaignId);

  // Calculate available escrow balance for the selected campaign
  // Available Escrow = raisedAmount - sum(PENDING, APPROVED, DISBURSED requestedAmount)
  const availableEscrow = campaign
    ? Math.max(
        0,
        campaign.raisedAmount -
          campaign.withdrawals
            .filter(w => w.status !== "REJECTED")
            .reduce((sum, w) => sum + w.requestedAmount, 0)
      )
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedCampaignId || !requestedAmount || !purpose) {
      setError("Please fill out all fields.");
      return;
    }

    const amount = parseFloat(requestedAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid requested amount.");
      return;
    }

    if (amount > availableEscrow) {
      setError(`Amount exceeds available escrow balance ($${availableEscrow.toFixed(2)}).`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          requestedAmount: amount,
          purpose,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      // Reset form on success
      setSelectedCampaignId("");
      setRequestedAmount("");
      setPurpose("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 text-left">
      
      {/* Request Form (Col Span 3) */}
      <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl h-fit">
        <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2 mb-4">
          Request Escrow Disbursement
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold">Select Campaign *</label>
            <select
              value={selectedCampaignId}
              onChange={(e) => {
                setSelectedCampaignId(e.target.value);
                setError("");
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-colors"
              required
            >
              <option value="">-- Select Active Campaign --</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} (Raised: ${c.raisedAmount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {campaign && (
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-slate-300 text-xs">
              Available Escrow Balance: <strong className="text-emerald-400 font-extrabold">${availableEscrow.toLocaleString()}</strong>
              <span className="text-[10px] text-slate-500 block mt-1">This is the net campaign funding minus existing requested/disbursed withdrawals.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold">Withdrawal Amount (USD) *</label>
            <input
              type="number"
              step="0.01"
              max={availableEscrow}
              placeholder="e.g. 2500"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-750 focus:outline-none focus:border-primary transition-colors"
              required
              disabled={!selectedCampaignId || availableEscrow <= 0}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold">Purpose / Itemized Justification *</label>
            <textarea
              placeholder="Detail exactly what items in your budget allocation plan this withdrawal covers. Administrators review this before releasing escrow."
              rows={4}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors resize-y"
              required
              disabled={!selectedCampaignId || availableEscrow <= 0}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedCampaignId || availableEscrow <= 0}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
          >
            <ArrowDownToLine className="h-4.5 w-4.5" />
            {loading ? "Submitting Request..." : "Request Fund Release"}
          </button>
        </form>
      </div>

      {/* Requests Status list (Col Span 2) */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2">
          Request History ({recentWithdrawals.length})
        </h3>

        {recentWithdrawals.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-500 italic">No fund releases requested yet.</span>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin">
            {recentWithdrawals.map((r) => (
              <div 
                key={r.id} 
                className="bg-slate-905 border border-slate-800/80 rounded-2xl p-4 space-y-3 text-[11px]"
              >
                <div className="flex justify-between items-start gap-1">
                  <div>
                    <h4 className="font-extrabold text-white truncate max-w-[120px]">{r.campaign.title}</h4>
                    <span className="text-[10px] text-slate-450 block mt-0.5">Amount: <strong className="text-white">${r.requestedAmount}</strong></span>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-bold border flex-shrink-0",
                    r.status === "DISBURSED" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    r.status === "PENDING" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                    r.status === "APPROVED" && "bg-primary/10 text-primary border-primary/20",
                    r.status === "REJECTED" && "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  )}>
                    {r.status}
                  </span>
                </div>

                <p className="text-slate-400 leading-relaxed text-xs line-clamp-3">{r.purpose}</p>

                <div className="flex justify-between items-center text-[9px] text-slate-550 border-t border-slate-850/50 pt-2.5">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(r.requestedAt).toLocaleDateString()}
                  </span>
                  
                  {/* Proof upload link */}
                  {r.status === "DISBURSED" && (
                    <span className="text-emerald-450 font-bold">Funds Released</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
