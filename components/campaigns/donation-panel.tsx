"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart, ShieldCheck, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface DonationPanelProps {
  campaignId: string;
  campaignTitle: string;
}

export default function DonationPanel({ campaignId, campaignTitle }: DonationPanelProps) {
  const { data: session } = useSession();
  
  const [amount, setAmount] = useState<string>("50");
  const [isCustom, setIsCustom] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = ["10", "25", "50", "100"];

  const handlePresetSelect = (val: string) => {
    setAmount(val);
    setIsCustom(false);
    setError(null);
  };

  const handleCustomChange = (val: string) => {
    // Only numeric
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setAmount(val);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid donation amount.");
      setLoading(false);
      return;
    }

    if (!session?.user) {
      // Validate guest fields
      if (!guestName.trim()) {
        setError("Please enter your name for receipt generation.");
        setLoading(false);
        return;
      }
      if (!guestEmail.trim() || !/\S+@\S+\.\S+/.test(guestEmail)) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        campaignId,
        amount: numericAmount,
        isAnonymous,
        message: message.trim() || null,
        donorName: session?.user ? session.user.name : guestName.trim(),
        donorEmail: session?.user ? session.user.email : guestEmail.trim().toLowerCase(),
      };

      const res = await fetch("/api/donations/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize checkout.");
      }

      // Redirect to Stripe checkout page (or mock payment page)
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned from server.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden h-fit sticky top-24">
      <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 blur-2xl rounded-full" />
      
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-5 w-5 text-rose-500 fill-rose-500 animate-pulse" />
        <h3 className="font-black text-sm text-white uppercase tracking-wider">Support Campaign</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Preset Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Select Amount</label>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handlePresetSelect(val)}
                className={cn(
                  "py-2 rounded-xl text-xs font-bold transition-all border",
                  amount === val && !isCustom
                    ? "bg-gradient-to-tr from-primary to-secondary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                    : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-850 hover:text-white"
                )}
              >
                ${val}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Or Custom Amount ($)</label>
          <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 focus-within:border-primary transition-colors">
            <span className="text-slate-500 font-bold text-xs mr-1">$</span>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                setIsCustom(true);
                handleCustomChange(e.target.value);
              }}
              placeholder="Enter custom amount..."
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full font-bold"
            />
          </div>
        </div>

        {/* Guest Fields if not logged in */}
        {!session?.user && (
          <div className="space-y-4 pt-3 border-t border-slate-850">
            <span className="text-[10px] text-primary uppercase font-bold tracking-wider block">Billing / Receipt Info (Guest)</span>
            
            {/* Guest Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-medium">Full Name</label>
              <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2">
                <User className="h-4 w-4 text-slate-500 mr-2" />
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Guest Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-medium">Email Address</label>
              <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2">
                <Mail className="h-4 w-4 text-slate-500 mr-2" />
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="johndoe@example.com"
                  className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Leave a Message (Optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write words of encouragement..."
            rows={3}
            className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary w-full resize-none"
          />
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">Donate Anonymously</span>
            <span className="text-[10px] text-slate-500">Hide your profile name from the public feed</span>
          </div>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-primary focus:ring-primary focus:ring-offset-slate-900 accent-primary cursor-pointer"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/25 text-danger text-[11px] font-semibold text-center leading-normal">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-xs font-bold text-white py-3 rounded-xl shadow-lg shadow-primary/20 transform transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1.5",
            loading && "opacity-75 cursor-not-allowed"
          )}
        >
          {loading ? (
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Heart className="h-4 w-4 fill-white" /> Donate Now
            </>
          )}
        </button>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-semibold pt-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Secured Escrow & Tax Compliant</span>
        </div>

      </form>
    </div>
  );
}
