"use client";

import { useState } from "react";
import { FileDown, Calendar, Search, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DonationRecord {
  id: string;
  amount: number;
  status: string;
  currency: string;
  receiptUrl: string | null;
  createdAt: string | Date;
  campaign: {
    title: string;
    organization: {
      name: string;
    };
  };
}

interface DonationHistoryListProps {
  donations: DonationRecord[];
}

export default function DonationHistoryList({ donations }: DonationHistoryListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [minAmount, setMinAmount] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Filter logic
  const filteredDonations = donations.filter((d) => {
    const matchesSearch = 
      d.campaign.title.toLowerCase().includes(search.toLowerCase()) ||
      d.campaign.organization.name.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    
    const matchesAmount = minAmount === "" || d.amount >= parseFloat(minAmount);
    
    return matchesSearch && matchesStatus && matchesAmount;
  });

  // Sort logic
  const sortedDonations = [...filteredDonations].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "amount-high") {
      return b.amount - a.amount;
    } else {
      return a.amount - b.amount;
    }
  });

  // Calculate annual summary (filtered by successful donations in current year 2026)
  const currentYear = new Date().getFullYear();
  const annualTotal = donations
    .filter((d) => d.status === "SUCCESS" && new Date(d.createdAt).getFullYear() === currentYear)
    .reduce((acc, d) => acc + d.amount, 0);

  const handlePrintAnnualSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Annual Tax Exemption Summary Card */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/15 to-primary/10 border border-primary/20 rounded-3xl p-6 relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl print:border-slate-300 print:text-black">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-[10px] text-primary uppercase font-extrabold tracking-wider print:text-slate-650">Annual Contribution Log</span>
          <h2 className="text-2xl font-black text-white leading-tight tracking-tight print:text-black">
            Year {currentYear} Tax Summary
          </h2>
          <p className="text-[11px] text-slate-400 max-w-md print:text-slate-500">
            Export a certified statement summarizing all platform contributions eligible for tax exempt write-offs this fiscal calendar.
          </p>
        </div>
        <div className="text-center sm:text-right flex-shrink-0 space-y-3">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Total Deductible</span>
            <span className="text-2xl font-black text-gradient block print:text-black">${annualTotal.toLocaleString()}</span>
          </div>
          {annualTotal > 0 && (
            <button
              onClick={handlePrintAnnualSummary}
              className="bg-slate-800 text-[10px] font-extrabold text-white px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-700 flex items-center gap-1.5 mx-auto sm:ml-auto transition-all transform hover:-translate-y-0.5 print:hidden"
            >
              <FileDown className="h-4 w-4" /> Export Statement
            </button>
          )}
        </div>
      </div>

      {/* Interactive Filters Toolbar */}
      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between print:hidden">
        <div className="flex flex-wrap items-center gap-3 flex-grow max-w-3xl">
          
          {/* Keyword Search */}
          <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 w-full sm:w-60 focus-within:border-primary transition-colors">
            <Search className="h-4 w-4 text-slate-500 mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search project or NGO..."
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-600"
            />
          </div>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          {/* Min Amount */}
          <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 w-32 focus-within:border-primary transition-colors">
            <span className="text-[10px] text-slate-500 font-bold mr-1.5">Min $</span>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="0"
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-slate-700"
            />
          </div>

        </div>

        {/* Sort drop dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none cursor-pointer print:hidden"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount-high">Amount (High to Low)</option>
          <option value="amount-low">Amount (Low to High)</option>
        </select>
      </div>

      {/* Donations Table */}
      <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 overflow-hidden">
        {sortedDonations.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No donations match your filter criteria.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Date & Reference</th>
                  <th>Campaign & Host NGO</th>
                  <th>Donation Amount</th>
                  <th>Status</th>
                  <th>Official Receipt</th>
                </tr>
              </thead>
              <tbody>
                {sortedDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-900/10 transition-colors">
                    <td>
                      <span className="text-slate-350 font-medium block text-xs">
                        {new Date(d.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-[10px] text-slate-650 block mt-0.5 font-mono">
                        Ref: {d.id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-white block text-xs">{d.campaign.title}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{d.campaign.organization.name}</span>
                    </td>
                    <td className="font-extrabold text-slate-200 text-xs">
                      ${d.amount.toLocaleString()} {d.currency}
                    </td>
                    <td>
                      <span className={cn(
                        "text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border",
                        d.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : d.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      )}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      {d.status === "SUCCESS" ? (
                        <a
                          href={d.receiptUrl || `/api/donations/${d.id}/receipt`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-secondary font-bold hover:underline"
                        >
                          Download PDF <FileDown className="h-4.5 w-4.5" />
                        </a>
                      ) : (
                        <span className="text-slate-600 text-xs italic">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
