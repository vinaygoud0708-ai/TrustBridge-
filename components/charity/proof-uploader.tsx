"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Calendar, AlertCircle, FileText, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProofItem {
  id: string;
  item: string;
  description: string;
  amount: number;
  proofType: string;
  proofFileUrl: string;
  status: string;
  uploadedAt: Date | string;
}

interface ProofUploaderProps {
  withdrawalId: string;
  withdrawalAmount: number;
  campaignTitle: string;
  initialProofs: ProofItem[];
}

export default function ProofUploader({
  withdrawalId,
  withdrawalAmount,
  campaignTitle,
  initialProofs,
}: ProofUploaderProps) {
  const router = useRouter();
  const [proofs, setProofs] = useState<ProofItem[]>(initialProofs);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [item, setItem] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [proofType, setProofType] = useState("INVOICE");
  const [proofFileUrl, setProofFileUrl] = useState("");

  const totalUploaded = proofs.reduce((sum, p) => sum + p.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!item || !description || !amount || !proofType) {
      setError("Please fill out all fields.");
      return;
    }

    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/withdrawals/${withdrawalId}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item,
          description,
          amount: parsedAmt,
          proofType,
          proofFileUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save fund usage proof");
      }

      // Append new proof record
      setProofs([data.fundUsage, ...proofs]);
      
      // Reset form fields
      setItem("");
      setDescription("");
      setAmount("");
      setProofFileUrl("");
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 text-left">
      
      {/* Upload Form (Col Span 3) */}
      <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl h-fit">
        <div className="border-b border-slate-850 pb-3 mb-5 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">Log Billing Details</h3>
            <p className="text-[10px] text-slate-500 mt-1">Upload verified bills, receipts, or photos for audit.</p>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            Total Disbursed: <span className="text-white">${withdrawalAmount.toLocaleString()}</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold font-bold">Item / Expense Name *</label>
            <input
              type="text"
              placeholder="e.g. 50 Water piping valves"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold font-bold">Billing Type *</label>
              <select
                value={proofType}
                onChange={(e) => setProofType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="BILL">Bill / Invoice</option>
                <option value="INVOICE">Tax Invoice</option>
                <option value="PHOTO">On-site photo evidence</option>
                <option value="BANK_STATEMENT">Bank Transfer Statement</option>
                <option value="REPORT">Audit Report Document</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold font-bold">Expense Amount (USD) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 1200"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold font-bold">Invoice Image or Document URL</label>
            <input
              type="url"
              placeholder="e.g. https://images.unsplash.com/photo-..."
              value={proofFileUrl}
              onChange={(e) => setProofFileUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors"
            />
            <span className="text-[10px] text-slate-500 block mt-1">Provide a public direct link. Defaults to a premium receipt mockup if left blank.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold font-bold">Expense Description *</label>
            <textarea
              placeholder="Brief explanation of this bill item, purchase source, and delivery details."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors resize-y"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
          >
            <Upload className="h-4 w-4" />
            {loading ? "Logging expense..." : "Submit Expense Proof"}
          </button>
        </form>
      </div>

      {/* Receipts list (Col Span 2) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="border-b border-slate-850 pb-2 flex justify-between items-baseline">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider">
            Logged Bills ({proofs.length})
          </h3>
          <span className="text-[10px] text-slate-500 font-bold">
            Total Logged: <span className="text-emerald-400">${totalUploaded.toLocaleString()}</span>
          </span>
        </div>

        {proofs.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-500 italic">No bill documents uploaded yet.</span>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto max-h-[550px] pr-2 scrollbar-thin">
            {proofs.map((pr) => (
              <div 
                key={pr.id} 
                className="bg-slate-905 border border-slate-800/80 rounded-2xl p-4 space-y-3 text-[11px]"
              >
                <div className="flex justify-between items-start gap-1">
                  <div>
                    <h4 className="font-extrabold text-white leading-snug">{pr.item}</h4>
                    <span className="text-[10px] text-slate-450 block mt-0.5">Logged: <strong className="text-emerald-450">${pr.amount}</strong></span>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-bold border inline-flex items-center gap-0.5",
                    pr.status === "VERIFIED" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    pr.status === "PENDING" && "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    {pr.status === "VERIFIED" ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                    {pr.status}
                  </span>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed">{pr.description}</p>

                <div className="flex justify-between items-center text-[9px] text-slate-550 border-t border-slate-850/50 pt-2.5">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(pr.uploadedAt).toLocaleDateString()}
                  </span>
                  
                  <a 
                    href={pr.proofFileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-primary hover:underline font-extrabold inline-flex items-center gap-0.5"
                  >
                    <FileText className="h-3 w-3" /> View Document
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
