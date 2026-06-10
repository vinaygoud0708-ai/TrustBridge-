import { Shield, Sparkles, Award, Star, CheckCircle } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-slate-300">
      
      {/* Title */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-white tracking-tight">About TrustBridge</h1>
        <p className="text-xs text-slate-400 mt-2">Built to address charity accountability and rebuild global donor relationships.</p>
      </div>

      {/* Grid Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Our Mission
          </h2>
          <p className="text-xs leading-relaxed text-slate-400">
            For decades, charity platforms have operated under a black-box model. Donors write a check and receive occasional pictures, with little visibility into exactly how their dollars are spent. High administration fees, double-billing, and lack of invoice tracking have eroded public confidence.
          </p>
          <p className="text-xs leading-relaxed text-slate-400">
            <strong>TrustBridge</strong> was founded by <strong>Masood Mirza</strong> with a singular, radical focus: complete financial auditability for every single donation. We enable donors to see where every dollar is spent, view matching proof of usage (like receipts and invoices), and check live NGO trust ratings computed by standard algorithms.
          </p>
        </div>
        <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 shadow-2xl">
          <h3 className="font-bold text-sm text-white mb-4">Core Platform Pillars</h3>
          <ul className="space-y-3.5 text-xs text-slate-400">
            <li className="flex gap-2.5 items-start">
              <CheckCircle className="h-4.5 w-4.5 text-primary mt-0.5 flex-shrink-0" />
              <span><strong>100% Transparency:</strong> Donors trace escrow releases down to individual vendor billing levels.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <CheckCircle className="h-4.5 w-4.5 text-secondary mt-0.5 flex-shrink-0" />
              <span><strong>Vetted Registrations:</strong> Every participating NGO passes multi-step legal checks.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span><strong>Algorithmic Ratings:</strong> Trust scores update live according to reporting compliance and ratings.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Trust Score Formula Section */}
      <div className="rounded-3xl bg-slate-950/30 border border-slate-900 p-8 md:p-10 mb-16">
        <h2 className="text-xl font-bold text-white tracking-tight mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-400 fill-amber-400" /> Trust Score Calculation
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          The Trust Score is a 100-point algorithm that evaluates each host charity's operational integrity. It is computed automatically without human intervention whenever verification status, campaigns, donor ratings, or compliance changes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="space-y-4">
            <div className="border-l-2 border-primary pl-4 py-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">1. Legal Verification Score (Max 30 Pts)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Gold Verified status awards 30 points, Silver Verified awards 20 points, and Bronze Verified awards 10 points.
              </p>
            </div>
            <div className="border-l-2 border-secondary pl-4 py-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">2. Reporting Compliance (Max 25 Pts)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Computed by dividing the number of verified, on-time usage proofs by the total approved withdrawals.
              </p>
            </div>
            <div className="border-l-2 border-emerald-400 pl-4 py-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">3. Donor Feedback Ratings (Max 20 Pts)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Derived directly from star ratings left by verified donors (calculated as <code>(Average Rating / 5) * 20</code>).
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="border-l-2 border-purple-400 pl-4 py-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">4. Campaign Completion (Max 15 Pts)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Calculated by dividing completed, fully-funded campaigns by the total campaigns launched.
              </p>
            </div>
            <div className="border-l-2 border-rose-400 pl-4 py-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">5. Complaint Deductions (Max 10 Pts)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Charities start with 10 points. Each active or unresolved platform complaint filed by users deducts 2 points (cannot drop below 0).
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Algorithmic Formula</span>
              <code className="text-xs font-semibold text-gradient block mt-1.5 font-mono">
                Total Score = Verification + Reporting + Rating + Completion + Complaint
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-8 text-center flex items-center justify-center gap-2">
          <Award className="h-6 w-6 text-secondary" /> Project Leadership
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="p-6 rounded-2xl glass-card text-center flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-2xl text-primary mb-4 shadow-lg">
              MM
            </div>
            <h3 className="font-bold text-base text-white">Masood Mirza</h3>
            <span className="text-xs text-slate-400 font-medium block mt-1">Founder & Chief Concept Planner</span>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Designed the core framework for Escrow Fund Flow controls and algorithmic Trust Score auditing models.
            </p>
          </div>
          <div className="p-6 rounded-2xl glass-card text-center flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-2xl text-secondary mb-4 shadow-lg">
              TB
            </div>
            <h3 className="font-bold text-base text-white">TrustBridge Engineering</h3>
            <span className="text-xs text-slate-400 font-medium block mt-1">Open-Source Core Development Team</span>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Responsible for the TypeScript, Next.js, and Prisma ORM implementations verifying real-time ledgers.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
