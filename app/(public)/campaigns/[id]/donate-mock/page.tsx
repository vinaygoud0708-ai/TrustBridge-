"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { CreditCard, ShieldCheck, ShoppingBag, ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function DonateMockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Await dynamic route params in Next.js 15+ client components using React.use
  const rawParams = useParams();
  const campaignId = rawParams.id as string;

  const amount = searchParams.get("amount") || "50";
  const isAnonymous = searchParams.get("isAnonymous") === "true";
  const message = searchParams.get("message") || "";
  const donorName = searchParams.get("donorName") || "Anonymous Friend";
  const donorEmail = searchParams.get("donorEmail") || "guest@trustbridge.com";

  const [campaignTitle, setCampaignTitle] = useState("Charity Campaign");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("242");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch campaign title
    fetch(`/api/campaigns/${campaignId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.title) setCampaignTitle(data.title);
      })
      .catch((e) => console.error(e));
  }, [campaignId]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const mockPaymentId = `ch_mock_${Math.random().toString(36).substring(2, 11)}`;
      
      const payload = {
        campaignId,
        amount: parseFloat(amount),
        isAnonymous,
        message: message || null,
        donorName,
        donorEmail,
        stripePaymentId: mockPaymentId,
      };

      // Call the mock webhook processor
      const res = await fetch("/api/donations/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "checkout.session.completed",
          data: {
            object: {
              id: `cs_mock_${Math.random().toString(36).substring(2, 11)}`,
              payment_status: "paid",
              metadata: {
                campaignId,
                isAnonymous: isAnonymous ? "true" : "false",
                message,
                donorName,
                donorEmail,
              },
              amount_total: Math.round(parseFloat(amount) * 100), // cents
              currency: "usd",
              id_stripe: mockPaymentId,
            }
          },
          isMock: true // Tells API route to skip Stripe verification
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Simulated checkout processing failed.");
      }

      // Redirect to success page
      router.push(`/campaigns/${campaignId}/success?session_id=${mockPaymentId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during simulated processing.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 text-slate-300">
      
      <Link href={`/campaigns/${campaignId}`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4" /> Cancel Payment
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 relative">
        <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 blur-2xl rounded-full" />
        
        {/* Stripe Branding Header mockup */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-1.5 text-white">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="font-extrabold text-sm uppercase tracking-wider">Stripe Sandbox Checkout</span>
          </div>
          <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
            TEST MODE
          </span>
        </div>

        {/* Invoice details */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 mb-6 flex justify-between items-start gap-4">
          <div className="min-w-0">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Billing Item</span>
            <span className="text-xs font-bold text-white mt-1 block truncate max-w-[200px]">{campaignTitle}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Donation for {donorName}</span>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Amount</span>
            <span className="text-xl font-black text-gradient mt-1 block">${parseFloat(amount).toFixed(2)}</span>
          </div>
        </div>

        {/* Error box */}
        {error && (
          <div className="p-3 bg-danger/10 border border-danger/25 text-danger text-xs font-semibold rounded-xl text-center mb-4 leading-normal">
            {error}
          </div>
        )}

        {/* CC form */}
        <form onSubmit={handlePay} className="space-y-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cardholder Name</label>
            <input
              type="text"
              required
              defaultValue={donorName}
              placeholder="Name on card"
              className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Card Number</label>
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 focus-within:border-primary">
              <CreditCard className="h-4.5 w-4.5 text-slate-600 mr-2" />
              <input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full font-mono tracking-wider placeholder-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Expiration Date</label>
              <input
                type="text"
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white text-center focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">CVC</label>
              <input
                type="text"
                required
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white text-center focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-secondary text-xs font-bold text-white py-3.5 rounded-xl shadow-lg shadow-primary/20 transform transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1.5 mt-6"
          >
            {loading ? (
              <span className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="h-4.5 w-4.5" /> Authorize Sandbox Charge
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-semibold pt-4">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Simulated encrypted SSL connection</span>
        </div>

      </div>
    </div>
  );
}
