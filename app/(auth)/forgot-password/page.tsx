"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ShieldCheck, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (!email) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger reset.");
      }

      setStep(2);
      setInfo("If the email is registered, a password reset code has been sent. Check console logs.");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (!otp || !newPassword || !confirmNewPassword) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Reset failed.");
      }

      router.push("/login?resetSuccess=true");
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Check code and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="text-center">
        <h2 className="text-xl font-black text-white">Reset Password</h2>
        <p className="text-[11px] text-slate-500 mt-1">
          {step === 1 ? "Enter your email to receive a temporary reset code." : "Enter OTP and your new password below."}
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold flex items-start gap-2 leading-relaxed">
          <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {info && (
        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold flex items-start gap-2 leading-relaxed">
          <Sparkles className="h-4.5 w-4.5 flex-shrink-0" />
          <span>{info}</span>
        </div>
      )}

      {/* STEP 1: Email Request Form */}
      {step === 1 && (
        <form onSubmit={handleSendReset} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Email Address</label>
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5">
              <Mail className="h-4.5 w-4.5 text-slate-500 mr-2 flex-shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-xs font-bold text-white py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transform transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1 mt-6"
          >
            {loading ? (
              <span className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Send Reset Code <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: OTP & New Password Form */}
      {step === 2 && (
        <form onSubmit={handleResetSubmit} className="space-y-4">
          
          {/* OTP Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block text-center">6-Digit Verification Code</label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-center text-base font-extrabold tracking-widest text-white focus:outline-none focus:border-primary placeholder-slate-800"
            />
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">New Password</label>
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5">
              <Lock className="h-4.5 w-4.5 text-slate-500 mr-2 flex-shrink-0" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-600"
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Confirm New Password</label>
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5">
              <Lock className="h-4.5 w-4.5 text-slate-500 mr-2 flex-shrink-0" />
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-xs font-bold text-white py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transform transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1 mt-6"
          >
            {loading ? (
              <span className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Reset Password <ArrowRight className="h-4 w-4" /></>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full py-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-semibold mt-2 block text-center"
          >
            Go Back
          </button>
        </form>
      )}

      {/* Footer link */}
      <div className="text-center pt-2 border-t border-slate-850 text-xs">
        <span className="text-slate-500">Remember password? </span>
        <Link href="/login" className="text-primary hover:underline font-bold">Log In</Link>
      </div>
    </div>
  );
}
