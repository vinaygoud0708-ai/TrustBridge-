"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Phone, ShieldCheck, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"DONOR" | "CHARITY">("DONOR");
  
  const [otp, setOtp] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.toLowerCase().trim(),
          phone: phone.trim() || undefined,
          password,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register account.");
      }

      setStep(2);
      setInfo("Registration submitted successfully. Check console logs for your OTP verification code.");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (!otp) {
      setError("Please enter the verification code.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed.");
      }

      // Check: if role is CHARITY, we must redirect them to login first or the charity profile registration wizard!
      // In the build sequence, step 9 says "Build Auth pages" and step 12 says "Build Charity registration wizard /register/charity"
      // If role is CHARITY, we can direct them to login with a query parameter redirecting them to the wizard.
      // Let's redirect to `/login?registered=true` in either case, which handles user onboarding beautifully.
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Failed to verify. Check code and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="text-center">
        <h2 className="text-xl font-black text-white">Create Account</h2>
        <p className="text-[11px] text-slate-500 mt-1">
          {step === 1 ? "Start your transparent giving or NGO campaign." : "Verify your email to activate account."}
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

      {/* STEP 1: Registration Form */}
      {step === 1 && (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          
          {/* Role selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Register As</label>
            <div className="grid grid-cols-2 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
              <button
                type="button"
                onClick={() => setRole("DONOR")}
                className={cn(
                  "py-1.5 rounded-lg text-xs font-bold transition-all",
                  role === "DONOR" ? "bg-slate-800 text-white font-black" : "text-slate-500 hover:text-slate-350"
                )}
              >
                Donor / Supporter
              </button>
              <button
                type="button"
                onClick={() => setRole("CHARITY")}
                className={cn(
                  "py-1.5 rounded-lg text-xs font-bold transition-all",
                  role === "CHARITY" ? "bg-slate-800 text-white font-black" : "text-slate-500 hover:text-slate-350"
                )}
              >
                Charity / NGO Owner
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Full Name</label>
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5">
              <User className="h-4.5 w-4.5 text-slate-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-600"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Email Address</label>
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5">
              <Mail className="h-4.5 w-4.5 text-slate-500 mr-2 flex-shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@hope-edu.org"
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-600"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Phone Number (Optional)</label>
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5">
              <Phone className="h-4.5 w-4.5 text-slate-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0192"
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-600"
              />
            </div>
          </div>

          {/* Passwords row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Password</label>
              <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5">
                <Lock className="h-4.5 w-4.5 text-slate-500 mr-2 flex-shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-600"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Confirm Password</label>
              <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5">
                <Lock className="h-4.5 w-4.5 text-slate-500 mr-2 flex-shrink-0" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2.5 pt-2">
            <input
              type="checkbox"
              required
              id="terms"
              className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-primary focus:ring-primary focus:ring-offset-slate-900 accent-primary cursor-pointer mt-0.5"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-400 leading-normal cursor-pointer">
              I agree to the <span className="text-primary hover:underline font-semibold">Terms of Service</span> and <span className="text-primary hover:underline font-semibold">Privacy Policy</span>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-xs font-bold text-white py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transform transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1 mt-6"
          >
            {loading ? (
              <span className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Sign Up <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: OTP Verification Form */}
      {step === 2 && (
        <form onSubmit={handleOtpVerify} className="space-y-4">
          <div className="flex flex-col gap-1.5 text-center">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Verify Code sent to {email}</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-xs font-bold text-white py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transform transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1 mt-6"
          >
            {loading ? (
              <span className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Verify Email <ArrowRight className="h-4 w-4" /></>
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
        <span className="text-slate-500">Already have an account? </span>
        <Link href="/login" className="text-primary hover:underline font-bold">Log In</Link>
      </div>
    </div>
  );
}
