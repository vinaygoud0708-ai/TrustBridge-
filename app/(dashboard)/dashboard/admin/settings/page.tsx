"use client";

import { useState } from "react";
import Link from "next/navigation";
import { ArrowLeft, Settings, DollarSign, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const [commission, setCommission] = useState("5.0");
  const [maxWithdrawalThreshold, setMaxWithdrawalThreshold] = useState("10000");
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [enforceStrictAudits, setEnforceStrictAudits] = useState(true);
  const [autoApproveCampaigns, setAutoApproveCampaigns] = useState(false);

  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess("System configuration variables updated successfully in platform config cache.");
    }, 800);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      
      {/* Back link */}
      <div>
        <a 
          href="/dashboard/admin" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-455 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Overview
        </a>
      </div>

      {/* Head */}
      <div>
        <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1">
          <Settings className="h-3.5 w-3.5" /> Platform variables
        </span>
        <h1 className="text-xl font-black text-white mt-1">Global Platform Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure regulatory compliance locks, commission structures, and platform engines toggles.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-450 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Financial Variables */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-1.5">
            <DollarSign className="h-4.5 w-4.5 text-primary" /> System Commission & Thresholds
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Platform Commission Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors"
                required
              />
              <span className="text-[9px] text-slate-500 block mt-1">System fee automatically deducted from peer donations volume.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Single Escrow Release Threshold (USD)</label>
              <input
                type="number"
                step="100"
                value={maxWithdrawalThreshold}
                onChange={(e) => setMaxWithdrawalThreshold(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors"
                required
              />
              <span className="text-[9px] text-slate-500 block mt-1">Disbursements above this trigger high-risk administrator validation flags.</span>
            </div>
          </div>
        </div>

        {/* Operational Policies Toggles */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-500" /> Regulatory Safety & Privacy Switches
          </h3>

          <div className="space-y-4">
            
            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-850 rounded-2xl">
              <div>
                <span className="font-bold text-xs text-white block">Allow Guest / Anonymous Giving</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Enable donors to suppress name listings on public boards.</span>
              </div>
              <button
                type="button"
                onClick={() => setAllowAnonymous(!allowAnonymous)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  allowAnonymous ? "bg-primary" : "bg-slate-800"
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  allowAnonymous ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-850 rounded-2xl">
              <div>
                <span className="font-bold text-xs text-white block">Strict Invoice Auditing</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Freeze withdrawals for NGOs having outstanding items past 30 days.</span>
              </div>
              <button
                type="button"
                onClick={() => setEnforceStrictAudits(!enforceStrictAudits)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  enforceStrictAudits ? "bg-primary" : "bg-slate-800"
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  enforceStrictAudits ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-850 rounded-2xl">
              <div>
                <span className="font-bold text-xs text-white block">Auto-Approve Campaign Submissions</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Skip administrator approval queue for GOLD tier verified charities.</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoApproveCampaigns(!autoApproveCampaigns)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  autoApproveCampaigns ? "bg-primary" : "bg-slate-800"
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  autoApproveCampaigns ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>

          </div>
        </div>

        {/* Submission */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Saving configs..." : "Commit Variables"}
          </button>
        </div>
      </form>

    </div>
  );
}
