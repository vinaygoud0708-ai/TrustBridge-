import { 
  ShieldCheck, 
  Search, 
  Heart, 
  TrendingUp, 
  FileSpreadsheet, 
  FileText, 
  DollarSign, 
  CheckCircle 
} from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-slate-300">
      
      {/* Title */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-white tracking-tight">How TrustBridge Works</h1>
        <p className="text-xs text-slate-400 mt-2">A structured walkthrough of the platform flow for donors and charity organizations.</p>
      </div>

      {/* For Donors Step-by-Step */}
      <section className="mb-20">
        <div className="flex items-center gap-3 border-b border-slate-900 pb-4 mb-8">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">For Donors & Supporters</h2>
            <p className="text-xs text-slate-400 mt-1">Traced giving from checkouts down to invoice clearances.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl glass-card relative">
            <span className="absolute -top-4 -left-3 text-5xl font-black text-slate-800 select-none">01</span>
            <div className="h-10 w-10 bg-slate-950 rounded-lg flex items-center justify-center mb-4 mt-2">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-sm text-white">Browse & Audit</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Search campaigns filtering by category, location, or trust score. Review the NGO's verification tier, previous campaigns, and budget plan line-items.
            </p>
          </div>
          <div className="p-6 rounded-2xl glass-card relative">
            <span className="absolute -top-4 -left-3 text-5xl font-black text-slate-800 select-none">02</span>
            <div className="h-10 w-10 bg-slate-950 rounded-lg flex items-center justify-center mb-4 mt-2">
              <DollarSign className="h-5 w-5 text-secondary" />
            </div>
            <h3 className="font-bold text-sm text-white">Secure Escrow Donation</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Donate safely via Stripe. Your funds are deposited into an escrow ledger. Instantly download a certified PDF tax receipt with a QR verification code.
            </p>
          </div>
          <div className="p-6 rounded-2xl glass-card relative">
            <span className="absolute -top-4 -left-3 text-5xl font-black text-slate-800 select-none">03</span>
            <div className="h-10 w-10 bg-slate-950 rounded-lg flex items-center justify-center mb-4 mt-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="font-bold text-sm text-white">Track Actual Expenditure</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Get in-app and email notifications as the charity requests disbursements and uploads receipts. You can inspect exact digital images of their invoices.
            </p>
          </div>
        </div>
      </section>

      {/* For Charities Step-by-Step */}
      <section className="mb-16">
        <div className="flex items-center gap-3 border-b border-slate-900 pb-4 mb-8">
          <div className="p-2 bg-secondary/10 rounded-xl border border-secondary/20 text-secondary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">For Charity Partners & NGOs</h2>
            <p className="text-xs text-slate-400 mt-1">Verification audits, fund tracking, and trust compliance metrics.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl glass-card relative">
            <span className="absolute -top-4 -left-3 text-5xl font-black text-slate-800 select-none">01</span>
            <div className="h-10 w-10 bg-slate-950 rounded-lg flex items-center justify-center mb-4 mt-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-sm text-white">Apply & Upload Docs</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Complete the Charity Registration Wizard. Upload your registration deed, tax exemption certificates, and banking credentials for admin validation.
            </p>
          </div>
          <div className="p-6 rounded-2xl glass-card relative">
            <span className="absolute -top-4 -left-3 text-5xl font-black text-slate-800 select-none">02</span>
            <div className="h-10 w-10 bg-slate-950 rounded-lg flex items-center justify-center mb-4 mt-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
            <h3 className="font-bold text-sm text-white">Launch Vetted Campaigns</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Define campaign stories and input an itemized, clear budget plan. Once approved by admins, your campaign goes live for public contributions.
            </p>
          </div>
          <div className="p-6 rounded-2xl glass-card relative">
            <span className="absolute -top-4 -left-3 text-5xl font-black text-slate-800 select-none">03</span>
            <div className="h-10 w-10 bg-slate-950 rounded-lg flex items-center justify-center mb-4 mt-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="font-bold text-sm text-white">Submit Financial Evidence</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Request escrow disbursements. Spend disbursed amounts and upload matching invoices/photographs within 14 days to keep your score positive.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Wrapper */}
      <div className="text-center bg-slate-900/40 rounded-3xl p-8 border border-slate-800">
        <h3 className="font-bold text-lg text-white mb-2">Ready to make a difference?</h3>
        <p className="text-xs text-slate-400 mb-6">Create an account today as a donor or a registered charity partner.</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/register?role=DONOR"
            className="bg-gradient-to-r from-primary to-secondary text-xs font-semibold text-white px-6 py-2.5 rounded-xl hover:opacity-95 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            Sign Up as Donor
          </Link>
          <Link
            href="/register?role=CHARITY"
            className="bg-slate-800 text-xs font-semibold text-slate-300 px-6 py-2.5 rounded-xl border border-slate-700 hover:text-white hover:bg-slate-700 transition-all"
          >
            Register NGO Profile
          </Link>
        </div>
      </div>

    </div>
  );
}
