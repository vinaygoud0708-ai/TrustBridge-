"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

interface ReportFormProps {
  campaignId: string;
  organizationId: string;
  orgName: string;
}

export default function ReportForm({ campaignId, organizationId, orgName }: ReportFormProps) {
  const router = useRouter();
  
  const [filedBy, setFiledBy] = useState("");
  const [type, setType] = useState("FRAUD");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<string[]>([""]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const addEvidenceField = () => {
    setEvidence([...evidence, ""]);
  };

  const removeEvidenceField = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const handleEvidenceChange = (index: number, value: string) => {
    const updated = [...evidence];
    updated[index] = value;
    setEvidence(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!description) {
      setError("Please describe the dispute reasons.");
      return;
    }

    setLoading(true);

    try {
      const filteredEvidence = evidence.filter(url => url.trim() !== "");
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          organizationId,
          filedBy,
          type,
          description,
          evidence: filteredEvidence,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to file dispute");
      }

      setSuccess("Your dispute case has been recorded. Administrators will audit details immediately.");
      setTimeout(() => {
        router.push(`/campaigns/${campaignId}`);
      }, 2500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-550 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-450 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Basic form card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
        
        {/* NGO Info */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-400">
          Target Entity: <strong className="text-white">{orgName}</strong>
        </div>

        {/* Filer details */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5">Filer Email / Name (Optional)</label>
          <input
            type="text"
            placeholder="e.g. anonymous@trustbridge.com or Vinay"
            value={filedBy}
            onChange={(e) => setFiledBy(e.target.value)}
            className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors"
          />
          <span className="text-[9px] text-slate-500 block mt-1">If logged in, your account profile is automatically linked to verify donor contributions.</span>
        </div>

        {/* Category of complaint */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5">Dispute Reason Type *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-colors"
          >
            <option value="FRAUD">Fraudulent Activities / False representation</option>
            <option value="MISUSE">Escrow Funds Misuse / Budget diversion</option>
            <option value="FAKE">Fake Campaign / Misleading media</option>
            <option value="OTHER">Other compliance concerns</option>
          </select>
        </div>

        {/* Descriptions */}
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5">Detail description of dispute reasons *</label>
          <textarea
            placeholder="Describe exactly what issues you discovered. Provide details such as missing updates, suspicious itemized expenditures, or mismatched information."
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors resize-y"
            required
          />
        </div>

      </div>

      {/* Evidence links */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-850 pb-2">
          <label className="block text-xs font-bold text-slate-450 uppercase">Evidence Logs</label>
          <button
            type="button"
            onClick={addEvidenceField}
            className="text-primary font-bold text-xs hover:underline flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" /> Add URL
          </button>
        </div>

        <div className="space-y-3">
          {evidence.map((url, index) => (
            <div key={index} className="flex gap-2 items-center">
              <div className="flex-grow">
                <input
                  type="url"
                  placeholder="e.g. Link to supporting document, news article, screenshot image"
                  value={url}
                  onChange={(e) => handleEvidenceChange(index, e.target.value)}
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-705 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => removeEvidenceField(index)}
                disabled={evidence.length === 1}
                className="p-2 rounded-xl bg-slate-955 text-slate-500 hover:text-rose-500 transition-all border border-slate-850 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-950/20 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          <AlertTriangle className="h-4.5 w-4.5" />
          {loading ? "Filing dispute case..." : "File Official Dispute"}
        </button>
      </div>

    </form>
  );
}
