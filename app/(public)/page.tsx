import Link from "next/link";
import prisma from "@/lib/prisma";
import CampaignCard from "@/components/campaigns/campaign-card";
import CharityCard from "@/components/charity/charity-card";
import LiveCounter from "@/components/shared/live-counter";
import { 
  GraduationCap, 
  Stethoscope, 
  Flame, 
  Leaf, 
  Users, 
  HeartHandshake, 
  Search, 
  ShieldCheck, 
  FileCheck, 
  Lock, 
  LineChart, 
  Award,
  Star,
  Quote
} from "lucide-react";

export const revalidate = 0; // Disable static rendering caching for live updates

export default async function HomePage() {
  // Safe database queries with try/catch fallbacks
  let totalRaised = 62250.0;
  let totalDonorsCount = 12;
  let verifiedNgosCount = 3;
  let activeCampaignsCount = 4;
  let featuredCampaigns: any[] = [];
  let approvedNgos: any[] = [];

  try {
    // Calculate global raised total
    const aggregation = await prisma.donation.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    });
    if (aggregation._sum.amount) {
      totalRaised = aggregation._sum.amount;
    }

    // Unique count of donors
    const uniqueDonors = await prisma.donation.groupBy({
      by: ["donorEmail"],
      where: { status: "SUCCESS" },
    });
    totalDonorsCount = uniqueDonors.length || 10;

    // Counts
    verifiedNgosCount = await prisma.organization.count({
      where: { status: "APPROVED" },
    });

    activeCampaignsCount = await prisma.campaign.count({
      where: { status: "ACTIVE" },
    });

    // Fetch featured campaigns
    featuredCampaigns = await prisma.campaign.findMany({
      where: { isFeatured: true, status: "ACTIVE" },
      include: {
        organization: {
          select: {
            name: true,
            verificationTier: true,
            trustScore: true,
          },
        },
      },
      take: 3,
    });

    // Fetch approved NGOs
    approvedNgos = await prisma.organization.findMany({
      where: { status: "APPROVED" },
      take: 3,
    });

  } catch (error) {
    console.error("Database fetch error on HomePage, loading seeds fallbacks:", error);
  }

  // Categories list
  const categories = [
    { name: "Education", id: "EDUCATION", icon: GraduationCap, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
    { name: "Healthcare", id: "HEALTH", icon: Stethoscope, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { name: "Disaster", id: "DISASTER", icon: Flame, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    { name: "Environment", id: "ENVIRONMENT", icon: Leaf, color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
    { name: "Community", id: "COMMUNITY", icon: Users, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    { name: "Religious", id: "RELIGIOUS", icon: HeartHandshake, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-radial-gradient from-primary/10 via-transparent to-transparent opacity-40 pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-gradient uppercase tracking-widest bg-primary/10 border border-primary/20 rounded-full mb-6">
            <HeartHandshake className="h-3.5 w-3.5" /> Next-Gen Giving
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight max-w-4xl mx-auto">
            We don't just move money, <br />
            <span className="text-gradient">we move trust.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            TrustBridge is the world's first decentralized auditing platform for charities. Track exactly where your donation goes, inspect verified invoices, and check live organization trust scores.
          </p>

          {/* Search bar & Live Counter layout */}
          <div className="mt-10 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Search Input Form */}
            <form action="/campaigns" className="md:col-span-2 flex items-center bg-slate-900/65 backdrop-blur-md rounded-2xl border border-slate-800 p-2 shadow-2xl">
              <div className="flex-grow flex items-center px-3 gap-2">
                <Search className="h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search campaigns, NGOs, locations..."
                  className="bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none w-full"
                />
              </div>
              <button 
                type="submit"
                className="bg-gradient-to-r from-primary to-secondary text-sm font-semibold text-white px-5 py-2.5 rounded-xl hover:opacity-95 transition-all flex items-center gap-1 shadow-md shadow-primary/25"
              >
                Search
              </button>
            </form>

            {/* Live Counter Box */}
            <div className="h-full">
              <LiveCounter initialAmount={totalRaised} />
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-b border-slate-900 bg-slate-950/20 my-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-4 flex flex-col gap-1">
            <span className="text-3xl font-black text-white">${totalRaised.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Raised</span>
          </div>
          <div className="p-4 flex flex-col gap-1 border-l border-slate-900">
            <span className="text-3xl font-black text-white">{verifiedNgosCount}</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Verified NGOs</span>
          </div>
          <div className="p-4 flex flex-col gap-1 border-l border-slate-900">
            <span className="text-3xl font-black text-white">{activeCampaignsCount}</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Campaigns</span>
          </div>
          <div className="p-4 flex flex-col gap-1 border-l border-slate-900">
            <span className="text-3xl font-black text-white">{totalDonorsCount}</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Happy Donors</span>
          </div>
        </div>
      </section>

      {/* CATEGORIES BROWSER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white tracking-tight">Browse by Cause</h2>
          <p className="text-xs text-slate-400 mt-2">Filter and inspect charity projects based on specific thematic areas.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={cat.id} 
                href={`/campaigns?category=${cat.id}`}
                className="group flex flex-col items-center justify-center p-6 rounded-2xl glass-card text-center hover:border-slate-600 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center border mb-3 transform transition-transform group-hover:scale-105 ${cat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED CAMPAIGNS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-10">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-white tracking-tight">Featured Campaigns</h2>
            <p className="text-xs text-slate-400 mt-2">Urgent, highly vetted projects that need your immediate support.</p>
          </div>
          <Link href="/campaigns" className="text-xs font-bold text-primary hover:text-secondary transition-colors">
            View All Campaigns →
          </Link>
        </div>
        
        {featuredCampaigns.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-slate-800 p-8">
            <p className="text-sm text-slate-500">No active featured campaigns. Run the database seed to load sample data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCampaigns.map((camp: any) => (
              <CampaignCard key={camp.id} campaign={camp} />
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 my-10 bg-slate-950/30 rounded-3xl border border-slate-900/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-secondary/5 via-transparent to-transparent pointer-events-none" />
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white tracking-tight">Our Transparency Engine</h2>
          <p className="text-xs text-slate-400 mt-2">How we guarantee that every single dollar reaches its target beneficiary.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-sm text-white">1. Strict Verification</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              NGOs must register and upload founder IDs, registration certificates, and bank statements for admin approval and tier badges.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
              <FileCheck className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-bold text-sm text-white">2. Budget Planning</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Every campaign is required to provide an itemized budget plan before going live, mapping exactly how funds will be spent.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="font-bold text-sm text-white">3. Escrow Controls</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Funds are held securely. NGOs request partial withdrawals which must be manually approved by administrators before release.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
              <LineChart className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="font-bold text-sm text-white">4. Upload Proof</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Charities must upload photographic proof, receipts, and invoices within 14 days of disbursement, or their account gets locked.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST SCORE EXPLANATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-md border border-primary/20">The Trust Score Gauge</span>
            <h2 className="text-3xl font-black text-white tracking-tight mt-4">
              Automated scoring <br />
              backed by data.
            </h2>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              We compile five unique dimensions to calculate each NGO's platform trust score dynamically out of 5 stars. No human bias, no hidden metrics.
            </p>
            <div className="space-y-4 mt-6">
              <div className="flex gap-3 items-start">
                <div className="p-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 mt-0.5">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">Verification Tier (30 pts)</h4>
                  <p className="text-[11px] text-slate-400">Bronze, Silver, or Gold tier validation depending on legal audit depth.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="p-1 bg-sky-500/10 text-sky-400 rounded-md border border-sky-500/20 mt-0.5">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">Reporting Compliance (25 pts)</h4>
                  <p className="text-[11px] text-slate-400">Percentage of withdrawal requests with on-time receipt proof uploads.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="p-1 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20 mt-0.5">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide">Donor Feedback (20 pts)</h4>
                  <p className="text-[11px] text-slate-400">Direct ratings and reviews submitted by verified campaign donors.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 bg-slate-900/40 rounded-3xl border border-slate-800 shadow-2xl relative">
            <div className="absolute top-0 right-0 h-40 w-40 bg-secondary/10 blur-3xl rounded-full" />
            <h3 className="font-bold text-sm text-white mb-6">Live Scoring Breakdown Example</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Legal Audit Verification</span>
                  <span>30 / 30</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Usage Proof Compliance</span>
                  <span>22 / 25</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: "88%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Donor Ratings Average</span>
                  <span>18 / 20</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "90%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Campaign Completion Rate</span>
                  <span>15 / 15</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Clean Record (No Complaints)</span>
                  <span>10 / 10</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full">
                  <div className="h-full bg-teal-400 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center mt-6">
                <div>
                  <span className="text-xs text-slate-500 font-bold block uppercase">Total Trust Rating</span>
                  <span className="text-2xl font-black text-white mt-1">95 <span className="text-xs text-slate-400 font-medium">/ 100</span></span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-2xl">
                  <Star className="h-5 w-5 fill-amber-400" />
                  <span className="text-lg font-black">4.8 <span className="text-xs font-medium">/ 5.0</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VERIFIED NGOS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-10">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-white tracking-tight">Verified Partner NGOs</h2>
            <p className="text-xs text-slate-400 mt-2">Vetted charity organizations managing projects with absolute financial reporting.</p>
          </div>
          <Link href="/charities" className="text-xs font-bold text-primary hover:text-secondary transition-colors">
            View All NGOs →
          </Link>
        </div>
        
        {approvedNgos.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-slate-800 p-8">
            <p className="text-sm text-slate-500">No verified charities found. Run the seed script.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {approvedNgos.map((ngo: any) => (
              <CharityCard key={ngo.id} charity={ngo} />
            ))}
          </div>
        )}
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 my-10 border-t border-slate-900">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white tracking-tight">What Donors Say</h2>
          <p className="text-xs text-slate-400 mt-2">Join thousands of transparent givers sharing impact validation reports.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl glass-card relative flex flex-col justify-between">
            <Quote className="absolute top-4 right-4 h-8 w-8 text-slate-800/80" />
            <p className="text-xs text-slate-300 italic leading-relaxed relative z-10">
              "Being able to download the invoice PDF of the medicine bought with my $50 contribution changed donation platforms for me forever. TrustBridge is incredible."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Arthur Pendragon</span>
                <span className="text-[10px] text-slate-500 block">Verified Gold Donor</span>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl glass-card relative flex flex-col justify-between">
            <Quote className="absolute top-4 right-4 h-8 w-8 text-slate-800/80" />
            <p className="text-xs text-slate-300 italic leading-relaxed relative z-10">
              "Finally, a portal that takes charity fraud seriously. The verification tiers (Bronze/Silver/Gold) make it simple to inspect the compliance level of any host NGO."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs">
                C
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Clara Oswald</span>
                <span className="text-[10px] text-slate-500 block">Active Donor</span>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl glass-card relative flex flex-col justify-between">
            <Quote className="absolute top-4 right-4 h-8 w-8 text-slate-800/80" />
            <p className="text-xs text-slate-300 italic leading-relaxed relative z-10">
              "The real-time counter updates and automated receipt generation are so smooth. I love checking the charity impact charts in my dashboard."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                G
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Gavin Belson</span>
                <span className="text-[10px] text-slate-500 block">Philanthropist</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION FOR NGOS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-20">
        <div className="relative rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/15 to-primary/10 border border-primary/20 p-8 md:p-12 text-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-radial-gradient from-secondary/5 via-transparent to-transparent pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Are you a registered NGO?</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-4 max-w-xl mx-auto leading-relaxed">
            Join TrustBridge to increase your donor conversion rate, display your verified badges, build platform trust scores, and leverage secure payment channels.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link 
              href="/register?role=CHARITY"
              className="bg-gradient-to-r from-primary to-secondary text-xs sm:text-sm font-semibold text-white px-6 py-3 rounded-xl hover:opacity-95 transform transition-all hover:-translate-y-0.5 shadow-md shadow-primary/20"
            >
              Apply as Charity Partner
            </Link>
            <Link 
              href="/how-it-works"
              className="bg-slate-800 text-xs sm:text-sm font-semibold text-slate-300 px-6 py-3 rounded-xl border border-slate-700/60 hover:text-white hover:bg-slate-700 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
