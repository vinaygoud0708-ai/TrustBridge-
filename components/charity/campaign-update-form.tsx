"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Image, Calendar, AlertCircle } from "lucide-react";

interface UpdateItem {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date | string;
}

interface CampaignUpdateFormProps {
  campaignId: string;
  campaignTitle: string;
  initialUpdates: UpdateItem[];
}

export default function CampaignUpdateForm({
  campaignId,
  campaignTitle,
  initialUpdates,
}: CampaignUpdateFormProps) {
  const router = useRouter();
  const [updates, setUpdates] = useState<UpdateItem[]>(initialUpdates);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !content) {
      setError("Please fill out Title and Content");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, imageUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to post update");
      }

      // Add new update to top of list
      setUpdates([data.update, ...updates]);
      
      // Clear form
      setTitle("");
      setContent("");
      setImageUrl("");
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 text-left">
      
      {/* Update Form (Col Span 3) */}
      <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl h-fit">
        <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2 mb-4">
          Publish An Update
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Update Title *</label>
            <input
              type="text"
              placeholder="e.g. Phase 1 Completed: Ground broke and foundations set"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Narrative Update Content *</label>
            <textarea
              placeholder="Provide a detailed description of what this fund has accomplished. Include quantities, milestones, and reports."
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-primary transition-colors resize-y"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Update Image URL (Optional)</label>
            <div className="relative">
              <Image className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-600" />
              <input
                type="url"
                placeholder="e.g. https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <span className="text-[10px] text-slate-550 block mt-1">Provide a link to support progress photos/receipt logs.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            {loading ? "Publishing Update..." : "Publish Timeline Update"}
          </button>
        </form>
      </div>

      {/* Existing Updates Feed (Col Span 2) */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2">
          Published Updates ({updates.length})
        </h3>

        {updates.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
            <span className="text-xs text-slate-500 italic">No timeline updates published for this campaign.</span>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin">
            {updates.map((up) => (
              <div 
                key={up.id} 
                className="bg-slate-905 border border-slate-800/80 rounded-2xl p-4 space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-extrabold text-xs text-white leading-snug">{up.title}</h4>
                  <span className="text-[9px] text-slate-500 flex items-center gap-1 flex-shrink-0">
                    <Calendar className="h-3 w-3" />
                    {new Date(up.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap">{up.content}</p>

                {up.imageUrl && (
                  <div className="relative h-28 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                    <img 
                      src={up.imageUrl} 
                      alt={up.title} 
                      className="object-cover h-full w-full opacity-90"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
