"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Award, Heart, CheckSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySpread {
  name: string;
  value: number;
}

interface ImpactChartsProps {
  categoryData: CategorySpread[];
  totalDonated: number;
  totalBeneficiaries: number;
  completedCampaignsCount: number;
}

export default function ImpactCharts({
  categoryData,
  totalDonated,
  totalBeneficiaries,
  completedCampaignsCount,
}: ImpactChartsProps) {
  // Chart configurations
  const COLORS = ["#0ea5e9", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#64748b"];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] font-bold"
      >
        {percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""}
      </text>
    );
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Visual Impact Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total beneficiaries */}
        <div className="p-6 rounded-2xl bg-slate-905 border border-slate-800 flex items-start gap-4">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary flex-shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Beneficiaries Assisted</span>
            <span className="text-xl font-black text-white mt-1 block">
              {totalBeneficiaries.toLocaleString()} people
            </span>
            <span className="text-[9px] text-slate-400 block mt-1">Direct community impact</span>
          </div>
        </div>

        {/* Total projects backed */}
        <div className="p-6 rounded-2xl bg-slate-905 border border-slate-800 flex items-start gap-4">
          <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary flex-shrink-0">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Lifetime Giving</span>
            <span className="text-xl font-black text-white mt-1 block">
              ${totalDonated.toLocaleString()}
            </span>
            <span className="text-[9px] text-slate-400 block mt-1">Vetted escrow funds</span>
          </div>
        </div>

        {/* Completed Projects */}
        <div className="p-6 rounded-2xl bg-slate-905 border border-slate-800 flex items-start gap-4">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 flex-shrink-0">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Completed Projects</span>
            <span className="text-xl font-black text-white mt-1 block">
              {completedCampaignsCount} goals
            </span>
            <span className="text-[9px] text-slate-400 block mt-1">100% funding achieved</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Recharts Pie Chart panel */}
        <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs text-white uppercase tracking-wider mb-2">Contribution Breakdown by Cause</h3>
            <p className="text-[10px] text-slate-500">Distribution of your financial giving across thematic campaign categories.</p>
          </div>
          
          <div className="h-64 w-full flex items-center justify-center mt-4">
            {categoryData.length === 0 ? (
              <span className="text-xs text-slate-550 italic">No contribution data for chart generation.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px", color: "white" }} 
                    itemStyle={{ color: "white" }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Narrative / Exemption Summary panel */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-amber-400" /> Your Giving Impact
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your platform contribution total has reached <strong className="text-white">${totalDonated.toLocaleString()}</strong>.
              This support has provided vital materials, infrastructure, and services to roughly <strong className="text-white">{totalBeneficiaries.toLocaleString()} beneficiaries</strong> globally.
            </p>
            <p className="text-xs text-slate-450 leading-relaxed">
              By utilizing TrustBridge's transparent escrow pipeline, you have ensured that your donations are strictly validated, preventing fraud and funding itemized budgets.
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-850 text-center mt-6">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Global Contribution Index</span>
            <span className="text-xs font-semibold text-gradient mt-1.5 block">Thank you for making a difference!</span>
          </div>
        </div>

      </div>

    </div>
  );
}

// Inline fallback import so TypeScript doesn't complain about unused tags
import { Users } from "lucide-react";
