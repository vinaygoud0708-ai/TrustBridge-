import prisma from "@/lib/prisma";
import CampaignCard from "@/components/campaigns/campaign-card";
import Link from "next/link";
import { Search, SlidersHorizontal, MapPin, Award, Star } from "lucide-react";

export const revalidate = 0; // Disable static routing cache to reflect active status changes

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CampaignsPage({ searchParams }: PageProps) {
  // Await async searchParams for Next.js 15 conformance
  const resolvedSearchParams = await searchParams;
  
  const search = (resolvedSearchParams.search as string) || "";
  const category = (resolvedSearchParams.category as string) || "ALL";
  const minTrust = parseFloat((resolvedSearchParams.minTrust as string) || "1.0");
  const location = (resolvedSearchParams.location as string) || "ALL";
  const status = (resolvedSearchParams.status as string) || "ALL";
  const sortBy = (resolvedSearchParams.sortBy as string) || "newest";

  // Fetch unique locations and categories for filter dropdowns
  let uniqueLocations: string[] = [];
  try {
    const locs = await prisma.campaign.findMany({
      select: { location: true },
      distinct: ["location"],
      where: { status: "ACTIVE" },
    });
    uniqueLocations = locs.map((l) => l.location).filter(Boolean);
  } catch (err) {
    console.error("Error fetching locations", err);
  }

  // Construct dynamic Prisma filter
  const whereClause: any = {};

  // Search filter
  if (search) {
    whereClause.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { location: { contains: search } },
      { organization: { name: { contains: search } } },
    ];
  }

  // Category filter
  if (category !== "ALL") {
    whereClause.category = category;
  }

  // Location filter
  if (location !== "ALL") {
    whereClause.location = location;
  }

  // Status/Urgency filter
  if (status === "URGENT") {
    whereClause.isUrgent = true;
    whereClause.status = "ACTIVE";
  } else if (status === "ACTIVE") {
    whereClause.status = "ACTIVE";
  } else if (status === "COMPLETED") {
    whereClause.status = "COMPLETED";
  } else if (status === "ALL") {
    // Show active and completed campaigns by default
    whereClause.status = { in: ["ACTIVE", "COMPLETED"] };
  } else {
    whereClause.status = status;
  }

  // Trust score filter
  if (minTrust > 1.0) {
    whereClause.organization = {
      trustScore: { gte: minTrust },
    };
  } else {
    // Basic structural check
    whereClause.organization = {
      status: "APPROVED",
    };
  }

  // Sort by logic
  let orderByClause: any = { createdAt: "desc" };
  if (sortBy === "funded") {
    orderByClause = { raisedAmount: "desc" };
  } else if (sortBy === "ending") {
    orderByClause = { endDate: "asc" };
  } else if (sortBy === "trust") {
    orderByClause = {
      organization: {
        trustScore: "desc",
      },
    };
  }

  // Fetch campaigns
  let campaigns: any[] = [];
  try {
    campaigns = await prisma.campaign.findMany({
      where: whereClause,
      include: {
        organization: {
          select: {
            name: true,
            verificationTier: true,
            trustScore: true,
          },
        },
      },
      orderBy: orderByClause,
    });
  } catch (error) {
    console.error("Error query campaigns database:", error);
  }

  const categories = [
    "ALL",
    "EDUCATION",
    "HEALTH",
    "DISASTER",
    "ENVIRONMENT",
    "COMMUNITY",
    "RELIGIOUS",
    "OTHER",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-black text-white tracking-tight">Browse Campaigns</h1>
        <p className="text-xs text-slate-400 mt-2">Find and fund vetted charity campaigns. Inspect transparent invoices and budget plans.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTER SIDEBAR (Desktop) */}
        <aside className="lg:col-span-1 rounded-2xl glass-card p-6 h-fit space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-sm text-white">Filters</h2>
          </div>

          <form action="/campaigns" method="GET" className="space-y-5">
            {/* Search Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Keywords</label>
              <div className="flex items-center bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2">
                <Search className="h-4 w-4 text-slate-500 mr-2" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="NGO name or keyword..."
                  className="bg-transparent border-none text-xs text-white placeholder-slate-600 focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Category</label>
              <select
                name="category"
                defaultValue={category}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-primary w-full cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Country / Location</label>
              <select
                name="location"
                defaultValue={location}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-primary w-full cursor-pointer"
              >
                <option value="ALL">All Locations</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Checkbox/Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Campaign Status</label>
              <select
                name="status"
                defaultValue={status}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-primary w-full cursor-pointer"
              >
                <option value="ALL">All Active</option>
                <option value="URGENT">Urgent Needs</option>
                <option value="ACTIVE">Ongoing (Active)</option>
                <option value="COMPLETED">Completed Goals</option>
              </select>
            </div>

            {/* Minimum Trust Score Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                <span>Min Trust Score</span>
                <span className="text-primary font-bold">{minTrust.toFixed(1)} ★</span>
              </div>
              <input
                type="range"
                name="minTrust"
                min="1.0"
                max="5.0"
                step="0.5"
                defaultValue={minTrust}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                <span>1.0 ★</span>
                <span>3.0 ★</span>
                <span>5.0 ★</span>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sort By</label>
              <select
                name="sortBy"
                defaultValue={sortBy}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-primary w-full cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="funded">Most Funded</option>
                <option value="ending">Ending Soon</option>
                <option value="trust">Highest Trust Score</option>
              </select>
            </div>

            {/* Filter Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
              <Link
                href="/campaigns"
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

        {/* CAMPAIGN GRID (Content Area) */}
        <main className="lg:col-span-3">
          {campaigns.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-dashed border-slate-800 bg-slate-950/20 p-8 flex flex-col items-center justify-center gap-3">
              <SlidersHorizontal className="h-10 w-10 text-slate-700" />
              <h3 className="font-bold text-sm text-slate-300 mt-2">No campaigns found</h3>
              <p className="text-xs text-slate-500 max-w-sm">No campaigns match your filters. Try resetting the criteria or keywords.</p>
              <Link
                href="/campaigns"
                className="mt-2 text-xs font-semibold text-primary hover:underline"
              >
                Reset all filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {campaigns.map((camp) => (
                <CampaignCard key={camp.id} campaign={camp} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
