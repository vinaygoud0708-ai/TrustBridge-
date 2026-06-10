import prisma from "@/lib/prisma";
import CharityCard from "@/components/charity/charity-card";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

export const revalidate = 0; // Disable static routing cache to reflect active status changes

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CharitiesPage({ searchParams }: PageProps) {
  // Await async searchParams for Next.js 15 conformance
  const resolvedSearchParams = await searchParams;
  
  const search = (resolvedSearchParams.search as string) || "";
  const tier = (resolvedSearchParams.tier as string) || "ALL";
  const sortBy = (resolvedSearchParams.sortBy as string) || "trust";

  // Construct dynamic Prisma filter
  const whereClause: any = {
    status: "APPROVED",
  };

  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { city: { contains: search } },
      { country: { contains: search } },
    ];
  }

  if (tier !== "ALL") {
    whereClause.verificationTier = tier;
  }

  // Sort by logic
  let orderByClause: any = { trustScore: "desc" };
  if (sortBy === "raised") {
    orderByClause = { totalRaised: "desc" };
  } else if (sortBy === "newest") {
    orderByClause = { createdAt: "desc" };
  }

  // Fetch approved charities
  let charities: any[] = [];
  try {
    charities = await prisma.organization.findMany({
      where: whereClause,
      orderBy: orderByClause,
    });
  } catch (error) {
    console.error("Error query charities database:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-black text-white tracking-tight">Verified Charity Organizations</h1>
        <p className="text-xs text-slate-400 mt-2">Browse the directory of fully audited NGOs. Check their live operational trust breakdowns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 rounded-2xl glass-card p-6 h-fit space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-sm text-white">Filters</h2>
          </div>

          <form action="/charities" method="GET" className="space-y-5">
            {/* Search Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Keywords</label>
              <div className="flex items-center bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2">
                <Search className="h-4 w-4 text-slate-500 mr-2" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="NGO name, city, country..."
                  className="bg-transparent border-none text-xs text-white placeholder-slate-600 focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Verification Tier Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Verification Tier</label>
              <select
                name="tier"
                defaultValue={tier}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-primary w-full cursor-pointer"
              >
                <option value="ALL">All Tiers</option>
                <option value="GOLD">Gold Verified</option>
                <option value="SILVER">Silver Verified</option>
                <option value="BRONZE">Bronze Verified</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sort By</label>
              <select
                name="sortBy"
                defaultValue={sortBy}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-primary w-full cursor-pointer"
              >
                <option value="trust">Highest Trust Score</option>
                <option value="raised">Most Funded</option>
                <option value="newest">Newest Partner</option>
              </select>
            </div>

            {/* Filter Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
              <Link
                href="/charities"
                className="w-full text-center px-4 py-2 border border-slate-850 hover:bg-slate-800/40 rounded-xl text-slate-400 text-xs font-semibold"
              >
                Reset
              </Link>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-primary/15"
              >
                Apply
              </button>
            </div>
          </form>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3">
          {charities.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-dashed border-slate-855 bg-slate-950/20 p-8 flex flex-col items-center justify-center gap-3">
              <SlidersHorizontal className="h-10 w-10 text-slate-700" />
              <h3 className="font-bold text-sm text-slate-300 mt-2">No organizations found</h3>
              <p className="text-xs text-slate-500 max-w-sm">No registered partner NGOs match your criteria. Try widening your search filters.</p>
              <Link
                href="/charities"
                className="mt-2 text-xs font-semibold text-primary hover:underline"
              >
                Reset all filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {charities.map((ngo) => (
                <CharityCard key={ngo.id} charity={ngo} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
