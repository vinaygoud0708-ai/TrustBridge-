"use client";

import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line 
} from "recharts";
import { TrendingUp, BarChart2 } from "lucide-react";

interface CampaignProgress {
  title: string;
  raised: number;
  goal: number;
}

interface MonthlyTrend {
  month: string;
  amount: number;
}

interface CharityChartsProps {
  campaignData: CampaignProgress[];
  monthlyData: MonthlyTrend[];
}

export default function CharityCharts({ campaignData, monthlyData }: CharityChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
      
      {/* Chart 1: Campaigns Goal vs Raised */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
        <div className="mb-4">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4 text-primary" /> Campaign Targets vs Raised
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Comparison of fundraising goals and actual amounts raised for your campaigns.</p>
        </div>
        
        <div className="h-64 w-full mt-2">
          {campaignData.length === 0 ? (
            <div className="h-full flex items-center justify-center border border-dashed border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-550 italic">No campaign data available.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={campaignData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="title" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px" }}
                  labelStyle={{ color: "white", fontWeight: "bold" }}
                  itemStyle={{ fontSize: "11px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="raised" name="Raised ($)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="goal" name="Goal ($)" fill="#1e293b" stroke="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Donation Trends (Over Time) */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
        <div className="mb-4">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> Donation Trends (Last 6 Months)
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Timeline representation of monthly received contributions.</p>
        </div>
        
        <div className="h-64 w-full mt-2">
          {monthlyData.length === 0 ? (
            <div className="h-full flex items-center justify-center border border-dashed border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-550 italic">No historical donation data available.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px" }}
                  labelStyle={{ color: "white", fontWeight: "bold" }}
                  itemStyle={{ fontSize: "11px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Line type="monotone" dataKey="amount" name="Donations ($)" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}
