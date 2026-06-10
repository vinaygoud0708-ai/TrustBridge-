"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const resetSuccess = searchParams.get("resetSuccess");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [loginMode, setLoginMode] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [otpSent, setOtpSent] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(
    registered ? "Account registered! Please verify using the OTP sent to your email." : 
    resetSuccess ? "Password updated. Please log in below." : null
  );

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      // Successful login! Fetch session to inspect role and redirect
      // Wait, router.push is faster, but we can do a hard reload or simple router redirect
      router.refresh();
      
      // Let's redirect dynamically. We can query the session or just push to /dashboard first.
      // Wait, NextAuth session endpoints will capture role in layout, let's redirect to `/dashboard/redirect` 
      // or implement local checks. Let's redirect to a generic dashboard landing or query session locally.
      // Wait! We can fetch the user details or just fetch /api/auth/session to see role before redirecting!
      // This is extremely robust and ensures perfect navigation:
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      
      if (sessionData?.user) {
        const role = sessionData.user.role;
        if (role === "ADMIN") {
          router.push("/dashboard/admin");
        } else if (role === "CHARITY") {
          router.push("/dashboard/charity");
        } else {
          router.push("/dashboard/donor");
        }
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
      setLoading(false);
    }
  };

  const sendOtpCode = async () => {
    if (!email) {
      setError("Please enter your email to request an OTP code.");
      return;
    }

    setOtpLoading(true);
    setError(null);
    setInfo(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch OTP.");
      }
      setOtpSent(true);
      setInfo(`Verification code dispatched. Check console logs.`);
    } catch (err: any) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    if (!email || !otp) {
      setError("Please fill in both Email and OTP code fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        otp,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      router.refresh();
      
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      
      if (sessionData?.user) {
        const role = sessionData.user.role;
        if (role === "ADMIN") {
          router.push("/dashboard/admin");
        } else if (role === "CHARITY") {
          router.push("/dashboard/charity");
        } else {
          router.push("/dashboard/donor");
        }
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP code.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="text-center">
        <h2 className="text-xl font-black text-white">Welcome Back</h2>
        <p className="text-[11px] text-slate-500 mt-1">Sign in to check project ledgers and audit updates.</p>
      </div>

      {/* Switch mode selector */}
      <div className="grid grid-cols-2 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
        <button
          type="button"
          onClick={() => {
            setLoginMode("PASSWORD");
            setError(null);
          }}
          className={cn(
            "py-1.5 rounded-lg text-xs font-bold transition-all",
            loginMode === "PASSWORD" ? "bg-slate-800 text-white font-black" : "text-slate-500 hover:text-slate-350"
          )}
        >
          Password Login
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginMode("OTP");
            setError(null);
          }}
          className={cn(
            "py-1.5 rounded-lg text-xs font-bold transition-all",
            loginMode === "OTP" ? "bg-slate-800 text-white font-black" : "text-slate-500 hover:text-slate-350"
          )}
        >
          OTP Code Login
        </button>
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

      {/* Mode Forms */}
      {loginMode === "PASSWORD" ? (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
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

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              <span>Password</span>
              <Link href="/forgot-password" className="text-primary hover:underline font-bold capitalize">Forgot?</Link>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-xs font-bold text-white py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transform transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1 mt-6"
          >
            {loading ? (
              <span className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Sign In <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOtpLogin} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Email Address</label>
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl p-1.5 pr-2 focus-within:border-primary">
              <div className="flex items-center flex-grow px-2">
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
              <button
                type="button"
                onClick={sendOtpCode}
                disabled={otpLoading || !email}
                className="bg-slate-800 text-[10px] font-bold text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 flex-shrink-0 whitespace-nowrap"
              >
                {otpLoading ? "Sending..." : otpSent ? "Resend" : "Send OTP"}
              </button>
            </div>
          </div>

          {otpSent && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">6-Digit Verification Code</label>
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
          )}

          <button
            type="submit"
            disabled={loading || !otpSent}
            className="w-full bg-gradient-to-r from-primary to-secondary text-xs font-bold text-white py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-95 transform transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Verify & Sign In <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
      )}

      {/* Footer link */}
      <div className="text-center pt-2 border-t border-slate-850 text-xs">
        <span className="text-slate-500">Don't have an account? </span>
        <Link href="/register" className="text-primary hover:underline font-bold">Sign Up</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-10">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-bold">Loading security panel...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
