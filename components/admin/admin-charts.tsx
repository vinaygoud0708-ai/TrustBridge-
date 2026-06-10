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
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { TrendingUp, PieChart as PieIcon } from "lucide-react";

interface MonthlyVolume {
  month: string;
  amount: number;
}

interface CategoryBreakdown {
  name: string;
  value: number;
}

interface AdminChartsProps {
  monthlyVolume: MonthlyVolume[];
  categoryBreakdown: CategoryBreakdown[];
}

export default function AdminCharts({ monthlyVolume, categoryBreakdown }: AdminChartsProps) {
  const COLORS = ["#0ea5e9", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#64748b"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 text-left">
      
      {/* Monthly Donation Volume (Col Span 3) */}
      <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" /> Monthly Transaction Volume (Gross)
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Timeline of cumulative platform donations over the last 6 months.</p>
        </div>
        
        <div className="h-64 w-full mt-2">
          {monthlyVolume.length === 0 ? (
            <div className="h-full flex items-center justify-center border border-dashed border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-550 italic">No volume logs found.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyVolume}
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
                <Line type="monotone" dataKey="amount" name="Donations Volume ($)" stroke="#0ea5e9" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Cause Category Distribution (Col Span 2) */}
      <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
            <PieIcon className="h-4 w-4 text-emerald-400" /> Cause Category Spread
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Platform-wide campaign distribution by thematic area.</p>
        </div>

        <div className="h-64 w-full mt-2 flex items-center justify-center">
          {categoryBreakdown.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-550 italic">No distribution logs.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={75}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px" }}
                  itemStyle={{ fontSize: "11px" }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}
