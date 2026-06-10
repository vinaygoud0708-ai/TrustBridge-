"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { CheckCircle2, FileDown, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function DonateSuccessPage() {
  const searchParams = useSearchParams();
  const rawParams = useParams();
  const campaignId = rawParams.id as string;
  const sessionId = searchParams.get("session_id") || "";

  const [campaignTitle, setCampaignTitle] = useState("Campaign");
  const [donationAmount, setDonationAmount] = useState(50.0);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get campaign title
    fetch(`/api/campaigns/${campaignId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.title) setCampaignTitle(data.title);
      })
      .catch((e) => console.error(e));

    // Get donation details by session_id
    if (sessionId) {
      // Find matching donation from platform API
      fetch(`/api/donations?stripePaymentId=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          // If search is a list, find matching transaction
          const list = Array.isArray(data) ? data : [data];
          const match = list.find((d: any) => d.stripePaymentId === sessionId || d.id === sessionId);
          if (match) {
            setDonationAmount(match.amount);
            setReceiptUrl(match.receiptUrl || `/api/donations/${match.id}/receipt`);
          }
        })
        .catch((e) => console.error(e));
    }
  }, [campaignId, sessionId]);

  const defaultReceiptLink = receiptUrl || `/api/donations/${sessionId}/receipt`;

  return (
    <div className="max-w-md mx-auto py-20 px-4 text-slate-300 text-center animate-fade-in-up">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 blur-2xl rounded-full" />
        
        {/* Celebration Tick Icon */}
        <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>

        <h1 className="text-2xl font-black text-white leading-tight">Contribution Confirmed!</h1>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Thank you for backing this project. Your contribution is currently held in escrow and can only be withdrawn for vetted expenses.
        </p>

        {/* Invoice details summary */}
        <div className="my-6 bg-slate-950/60 border border-slate-850 p-4 rounded-2xl text-left space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Campaign</span>
            <span className="font-semibold text-white truncate max-w-[180px]">{campaignTitle}</span>
          </div>
          <div className="flex justify-between text-xs border-t border-slate-900 pt-2">
            <span className="text-slate-500">Amount Charged</span>
            <span className="font-black text-emerald-400">${donationAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          {sessionId && (
            <div className="flex justify-between text-[11px] border-t border-slate-900 pt-2">
              <span className="text-slate-500">Payment Reference</span>
              <span className="font-mono text-slate-400 truncate max-w-[150px]">{sessionId}</span>
            </div>
          )}
        </div>

        {/* Action button grids */}
        <div className="flex flex-col gap-2.5">
          <a
            href={defaultReceiptLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-primary to-secondary text-xs font-bold text-white py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transform transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
          >
            <FileDown className="h-4.5 w-4.5" /> Download Tax Receipt PDF
          </a>

          <Link
            href={`/campaigns/${campaignId}`}
            className="w-full py-3 bg-slate-800 border border-slate-700/60 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition-all flex items-center justify-center gap-1"
          >
            Return to Campaign Detail <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-600 font-semibold pt-6 border-t border-slate-850 mt-6">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Transparency validated by TrustBridge Ledger</span>
        </div>

      </div>
    </div>
  );
}
