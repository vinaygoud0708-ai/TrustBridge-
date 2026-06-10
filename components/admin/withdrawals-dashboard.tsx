"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowDownToLine, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FundUsageItem {
  id: string;
  item: string;
  description: string;
  amount: number;
  proofType: string;
  proofFileUrl: string;
  status: string;
  uploadedAt: Date | string;
  campaign: {
    title: string;
  };
}

interface WithdrawalItem {
  id: string;
  requestedAmount: number;
  purpose: string;
  status: string;
  requestedAt: Date | string;
  campaign: {
    title: string;
  };
  organization: {
    name: string;
  };
  adminNote: string | null;
}

interface WithdrawalsDashboardProps {
  withdrawals: WithdrawalItem[];
  pendingProofs: FundUsageItem[];
}

export default function WithdrawalsDashboard({ withdrawals, pendingProofs }: WithdrawalsDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"withdrawals" | "proofs">("withdrawals");
  
  // Withdrawal states
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState("");
  const [status, setStatus] = useState("DISBURSED");
  const [adminNote, setAdminNote] = useState("");
  const [loadingWithdrawal, setLoadingWithdrawal] = useState(false);
  const [errorWithdrawal, setErrorWithdrawal] = useState("");
  const [successWithdrawal, setSuccessWithdrawal] = useState("");

  // Proofs states
  const [loadingProofId, setLoadingProofId] = useState("");
  const [errorProof, setErrorProof] = useState("");

  const withdrawal = withdrawals.find(w => w.id === selectedWithdrawalId);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorWithdrawal("");
    setSuccessWithdrawal("");
    setLoadingWithdrawal(true);

    try {
      const response = await fetch("/api/admin/withdrawals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawalId: selectedWithdrawalId,
          status,
          adminNote,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update withdrawal request");
      }

      setSuccessWithdrawal("Withdrawal request updated successfully.");
      router.refresh();
    } catch (err: any) {
      setErrorWithdrawal(err.message || "An error occurred");
    } finally {
      setLoadingWithdrawal(false);
    }
  };

  const handleVerifyProof = async (proofId: string) => {
    setErrorProof("");
    setLoadingProofId(proofId);

    try {
      const response = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundUsageId: proofId,
          status: "VERIFIED",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify proof");
      }

      router.refresh();
    } catch (err: any) {
      setErrorProof(err.message || "An error occurred while verifying proof");
    } finally {
      setLoadingProofId("");
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab("withdrawals")}
          className={cn(
            "px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5",
            activeTab === "withdrawals" 
              ? "border-primary text-white" 
              : "border-transparent text-slate-500 hover:text-slate-300"
          )}
        >
          <ArrowDownToLine className="h-4 w-4" /> Withdrawal Requests
        </button>
        <button
          onClick={() => setActiveTab("proofs")}
          className={cn(
            "px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5",
            activeTab === "proofs" 
              ? "border-primary text-white" 
              : "border-transparent text-slate-500 hover:text-slate-300"
          )}
        >
          <FileText className="h-4 w-4" /> Receipts Verification ({pendingProofs.length})
        </button>
      </div>

      {/* Tab 1: Withdrawal Requests */}
      {activeTab === "withdrawals" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Requests selection column (Col Span 4) */}
          <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-2xl h-fit space-y-4">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2">
              Requests Queue
            </h3>

            {withdrawals.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-855 rounded-2xl">
                <span className="text-xs text-slate-500 italic">No withdrawal requests logged.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                {withdrawals.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setSelectedWithdrawalId(w.id);
                      setStatus(w.status === "PENDING" ? "DISBURSED" : w.status);
                      setAdminNote(w.adminNote || "");
                      setErrorWithdrawal("");
                      setSuccessWithdrawal("");
                    }}
                    className={cn(
                      "w-full p-4 rounded-2xl border transition-all text-left block space-y-2",
                      selectedWithdrawalId === w.id
                        ? "bg-primary/10 border-primary text-white"
                        : "bg-slate-905 border-slate-850 hover:bg-slate-800/30 text-slate-350"
                    )}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-bold text-xs truncate max-w-[130px]">{w.campaign.title}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-extrabold",
                        w.status === "DISBURSED" && "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20",
                        w.status === "PENDING" && "bg-amber-500/10 text-amber-450 border border-amber-500/20",
                        w.status === "APPROVED" && "bg-primary/10 text-primary border border-primary/20",
                        w.status === "REJECTED" && "bg-rose-500/10 text-rose-550 border border-rose-500/20"
                      )}>
                        {w.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-500">
                      <span>NGO: {w.organization.name}</span>
                      <span className="font-bold text-slate-300">${w.requestedAmount.toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details actions column (Col Span 8) */}
          <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            {!withdrawal ? (
              <div className="py-20 text-center border border-dashed border-slate-850 rounded-2xl flex flex-col justify-center items-center">
                <Briefcase className="h-8 w-8 text-slate-655 mb-3" />
                <span className="text-xs text-slate-550 italic">Select a withdrawal request from the queue to process.</span>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="border-b border-slate-850 pb-4">
                  <h2 className="text-base font-black text-white">Disbursement Request Audit</h2>
                  <p className="text-xs text-slate-400 mt-1">Audit escrow fund request before initiating bank transfer.</p>
                  
                  <div className="mt-3.5 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-slate-500 font-semibold">
                    <span>NGO: <strong className="text-white">{withdrawal.organization.name}</strong></span>
                    <span>Campaign: <strong className="text-white">{withdrawal.campaign.title}</strong></span>
                  </div>
                </div>

                {/* Justification summary */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider">Itemized Justification</h4>
                  <p className="text-xs text-slate-400 leading-relaxed p-4 bg-slate-950/40 border border-slate-850 rounded-2xl whitespace-pre-wrap">
                    {withdrawal.purpose}
                  </p>
                </div>

                {/* Math balance */}
                <div className="flex justify-between items-center p-4 bg-slate-950 border border-slate-850 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Requested Disbursement</span>
                    <span className="text-lg font-black text-white block mt-0.5">${withdrawal.requestedAmount.toLocaleString()}</span>
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold border",
                    withdrawal.status === "DISBURSED" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    withdrawal.status === "PENDING" && "bg-amber-500/10 text-amber-450 border-amber-500/20",
                    withdrawal.status === "APPROVED" && "bg-primary/10 text-primary border-primary/20",
                    withdrawal.status === "REJECTED" && "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  )}>
                    {withdrawal.status}
                  </span>
                </div>

                {/* Decision form */}
                <form onSubmit={handleWithdrawalSubmit} className="space-y-4 pt-4 border-t border-slate-850">
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider">Administrative Verification</h4>

                  {errorWithdrawal && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                      <span>{errorWithdrawal}</span>
                    </div>
                  )}

                  {successWithdrawal && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-450 flex-shrink-0" />
                      <span>{successWithdrawal}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold">Action Decision</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="PENDING">PENDING - Hold Review</option>
                        <option value="APPROVED">APPROVED - Awaiting Bank Router</option>
                        <option value="DISBURSED">DISBURSED - Release Funds</option>
                        <option value="REJECTED">REJECTED - Request Refused</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold">Administrative notes (Reason for actions)</label>
                      <input
                        type="text"
                        placeholder="e.g. Budget matches invoice allocations. Approved for payout."
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingWithdrawal}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="h-4.5 w-4.5" />
                    {loadingWithdrawal ? "Processing..." : "Commit Disbursement Decisions"}
                  </button>
                </form>

              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 2: Logged Receipts Verification */}
      {activeTab === "proofs" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Expense Invoice Receipts Queue</h3>
            <p className="text-xs text-slate-500 mt-1">Verify charity billing declarations against disbursement accounts.</p>
          </div>

          {errorProof && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-550 flex-shrink-0" />
              <span>{errorProof}</span>
            </div>
          )}

          {pendingProofs.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-850 rounded-2xl">
              <span className="text-xs text-slate-500 italic">No pending invoice bills require verification review.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProofs.map((proof) => (
                <div 
                  key={proof.id}
                  className="p-5 rounded-2xl bg-slate-955 border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs"
                >
                  <div className="space-y-1 max-w-lg">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{proof.proofType} • Campaign: {proof.campaign.title}</span>
                    <h4 className="font-extrabold text-white text-sm mt-0.5">{proof.item}</h4>
                    <p className="text-slate-450 mt-1 text-xs leading-relaxed">{proof.description}</p>
                    <span className="text-[9px] text-slate-550 block pt-1">Logged on {new Date(proof.uploadedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-row md:flex-col items-end gap-3 shrink-0">
                    <span className="text-sm font-black text-emerald-450">${proof.amount.toLocaleString()}</span>
                    <div className="flex gap-2">
                      <a 
                        href={proof.proofFileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-[10px] text-slate-350 hover:text-white transition-all inline-flex items-center gap-0.5"
                      >
                        File <ExternalLink className="h-3 w-3" />
                      </a>
                      <button
                        onClick={() => handleVerifyProof(proof.id)}
                        disabled={loadingProofId === proof.id}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 text-[10px] font-bold transition-all"
                      >
                        {loadingProofId === proof.id ? "Auditing..." : "Approve Bill"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
