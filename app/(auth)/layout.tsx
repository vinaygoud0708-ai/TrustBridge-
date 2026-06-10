import Link from "next/link";
import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-radial-gradient from-primary/10 via-transparent to-transparent opacity-30 pointer-events-none -z-10" />

      {/* Auth Box Container */}
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        
        {/* Branding header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20 transform transition-transform group-hover:scale-105">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-primary transition-colors">
              Trust<span className="text-secondary">Bridge</span>
            </span>
          </Link>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1">Transparent Charity Platform</p>
        </div>

        {/* Auth form panels */}
        <div className="bg-slate-900/55 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 blur-2xl rounded-full" />
          {children}
        </div>

        {/* Support note */}
        <p className="text-center text-[11px] text-slate-600 font-medium">
          Need help? Contact support at +91 86868 67862
        </p>

      </div>
    </div>
  );
}
