"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Sparkles, 
  Info, 
  DollarSign, 
  MapPin, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetItem {
  id: string;
  item: string;
  amount: number;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [category, setCategory] = useState("EDUCATION");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coverImage, setCoverImage] = useState("");

  // Budget allocations
  const [budgetPlan, setBudgetPlan] = useState<BudgetItem[]>([
    { id: "1", item: "Core materials & logistics", amount: 0 },
  ]);

  const addBudgetItem = () => {
    setBudgetPlan([
      ...budgetPlan,
      { id: Date.now().toString(), item: "", amount: 0 },
    ]);
  };

  const removeBudgetItem = (id: string) => {
    setBudgetPlan(budgetPlan.filter((b) => b.id !== id));
  };

  const updateBudgetItem = (id: string, field: "item" | "amount", value: any) => {
    setBudgetPlan(
      budgetPlan.map((b) => {
        if (b.id === id) {
          return {
            ...b,
            [field]: field === "amount" ? parseFloat(value) || 0 : value,
          };
        }
        return b;
      })
    );
  };

  const totalBudgeted = budgetPlan.reduce((sum, b) => sum + b.amount, 0);
  const targetGoal = parseFloat(goalAmount) || 0;
  const isBudgetMatchingGoal = Math.abs(totalBudgeted - targetGoal) < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !description || !story || !goalAmount || !location || !startDate || !endDate) {
      setError("Please fill out all required fields marked with *");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError("End date must be after start date.");
      return;
    }

    if (budgetPlan.some((b) => !b.item || b.amount <= 0)) {
      setError("All budget items must have a description and an amount greater than zero.");
      return;
    }

    setLoading(true);

    try {
      const formattedPlan = budgetPlan.map(({ item, amount }) => ({ item, amount }));
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          story,
          goalAmount,
          category,
          location,
          startDate,
          endDate,
          coverImage,
          usagePlan: formattedPlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create campaign");
      }

      router.push("/dashboard/charity/campaigns");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      
      {/* Back link */}
      <div>
        <Link 
          href="/dashboard/charity" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-450 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> Launch New Campaign
          </h1>
          <p className="text-xs text-slate-400 mt-1">Register a transparent, itemized campaign for admin review and donor listing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Basic details */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2">1. Basic Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Campaign Title *</label>
              <input
                type="text"
                placeholder="e.g. Clean drinking water wells for village communities"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="EDUCATION">Education</option>
                  <option value="HEALTH">Health & Medicine</option>
                  <option value="DISASTER">Disaster Relief</option>
                  <option value="ENVIRONMENT">Environment</option>
                  <option value="COMMUNITY">Community Development</option>
                  <option value="RELIGIOUS">Religious & Cultural</option>
                  <option value="OTHER">Other Causes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Location / Region *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-600" />
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Goal Amount (USD) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-600" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 15000"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Start Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-600" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">End Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-600" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Cover Image URL</label>
              <input
                type="url"
                placeholder="e.g. https://images.unsplash.com/photo-..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Provide a public direct link. Defaults to a premium placeholder if left empty.</span>
            </div>
          </div>
        </div>

        {/* Section 2: Copywriting */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2">2. Narrative & Story</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Short Description *</label>
              <input
                type="text"
                placeholder="Briefly state the core purpose of this campaign in 1-2 sentences."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Detailed Story *</label>
              <textarea
                placeholder="Write a comprehensive story about who you are helping, why the campaign is necessary, and the plan of execution. Markdown supported."
                rows={8}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors resize-y"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Itemized Budget allocations */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">3. Itemized Budget Allocation</h3>
            <button
              type="button"
              onClick={addBudgetItem}
              className="text-primary font-bold text-xs hover:underline flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Budget Item
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-2.5 text-slate-350">
            <Info className="h-4.5 w-4.5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-[10px] leading-relaxed">
              TrustBridge utilizes an escrow system. Fund disbursement requests are validated against this specific budget list.
              Ensure that your total allocated budget sums up exactly to your campaign goal.
            </span>
          </div>

          <div className="space-y-3">
            {budgetPlan.map((budget, index) => (
              <div key={budget.id} className="flex gap-3 items-center">
                <div className="flex-grow">
                  <input
                    type="text"
                    placeholder="e.g. Well digging machinery & parts"
                    value={budget.item}
                    onChange={(e) => updateBudgetItem(budget.id, "item", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div className="w-32 relative">
                  <DollarSign className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-600" />
                  <input
                    type="number"
                    placeholder="0"
                    value={budget.amount || ""}
                    onChange={(e) => updateBudgetItem(budget.id, "amount", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeBudgetItem(budget.id)}
                  disabled={budgetPlan.length === 1}
                  className="p-2.5 rounded-xl bg-slate-950 text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all border border-slate-850 disabled:opacity-50 disabled:hover:text-slate-500 disabled:hover:bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Budget Matching Status */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-850">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Budget Assigned</span>
              <span className="text-sm font-bold text-white">${totalBudgeted.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Campaign Goal</span>
              <span className="text-sm font-bold text-white">${targetGoal.toLocaleString()}</span>
            </div>
          </div>

          {!isBudgetMatchingGoal && targetGoal > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-amber-300 text-[10px] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span>
                Attention: Current budget allocation of <strong>${totalBudgeted.toLocaleString()}</strong> does not match your campaign goal of <strong>${targetGoal.toLocaleString()}</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard/charity/campaigns"
            className="px-6 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/20 text-xs font-bold transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            {loading ? "Registering Campaign..." : "Submit for Approval"}
          </button>
        </div>
      </form>

    </div>
  );
}
