"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  AlertTriangle, 
  User, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  ShieldAlert,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplaintItem {
  id: string;
  filedBy: string;
  type: string;
  description: string;
  evidence: string; // JSON array string
  status: string;
  adminNote: string | null;
  createdAt: Date | string;
  organization: {
    name: string;
  };
  campaign: {
    title: string;
  } | null;
}

interface ComplaintsDashboardProps {
  complaints: ComplaintItem[];
}

export default function ComplaintsDashboard({ complaints }: ComplaintsDashboardProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("INVESTIGATING");
  const [adminNote, setAdminNote] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const complaint = complaints.find(c => c.id === selectedId);

  // Parse evidence URLs
  let evidenceUrls: string[] = [];
  if (complaint) {
    try {
      evidenceUrls = JSON.parse(complaint.evidence) || [];
    } catch {
      evidenceUrls = [];
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/complaints", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId: selectedId,
          status,
          adminNote,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update complaint");
      }

      setSuccess("Dispute case updated successfully.");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      
      {/* Dispute Selection List (Col Span 4) */}
      <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-2xl h-fit space-y-4">
        <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2">
          Disputes Queue
        </h3>

        {complaints.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-855 rounded-2xl">
            <span className="text-xs text-slate-500 italic">No disputes registered.</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {complaints.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedId(c.id);
                  setStatus(c.status);
                  setAdminNote(c.adminNote || "");
                  setError("");
                  setSuccess("");
                }}
                className={cn(
                  "w-full p-4 rounded-2xl border transition-all text-left block space-y-2",
                  selectedId === c.id
                    ? "bg-primary/10 border-primary text-white"
                    : "bg-slate-905 border-slate-850 hover:bg-slate-800/30 text-slate-350"
                )}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs truncate max-w-[130px]">{c.type} Complaint</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-extrabold",
                    c.status === "OPEN" && "bg-rose-500/10 text-rose-500 border border-rose-500/20",
                    c.status === "INVESTIGATING" && "bg-amber-500/10 text-amber-450 border border-amber-500/20",
                    c.status === "RESOLVED" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                    c.status === "DISMISSED" && "bg-slate-805 text-slate-400 border border-slate-700"
                  )}>
                    {c.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-505 font-medium">
                  <span>Target: {c.organization.name}</span>
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details & Actions Panel (Col Span 8) */}
      <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {!complaint ? (
          <div className="py-20 text-center border border-dashed border-slate-850 rounded-2xl flex flex-col justify-center items-center">
            <AlertTriangle className="h-8 w-8 text-slate-655 mb-3" />
            <span className="text-xs text-slate-500 italic">Select a dispute case from the queue to review details and document resolution audits.</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="border-b border-slate-850 pb-4">
              <span className="text-[10px] text-rose-450 font-bold uppercase tracking-wider">Dispute Case Sheet</span>
              <h2 className="text-base font-black text-white mt-1">{complaint.type} Complaint</h2>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Filed by: <strong className="text-white">{complaint.filedBy}</strong> • Target: <strong className="text-white">{complaint.organization.name}</strong>
                {complaint.campaign && (
                  <> • Campaign: <strong className="text-white">{complaint.campaign.title}</strong></>
                )}
              </p>
            </div>

            {/* Description details */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">Complaint Description</h4>
              <p className="text-xs text-slate-450 leading-relaxed p-4 bg-slate-950/40 border border-slate-850 rounded-2xl whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {/* Evidence attachment */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" /> Submitted Evidence Attachments
              </h4>

              {evidenceUrls.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-slate-850 rounded-xl">
                  <span className="text-xs text-slate-550 italic">No evidence attachments filed.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {evidenceUrls.map((url, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-855 flex justify-between items-center text-xs"
                    >
                      <span className="font-bold text-white block">Evidence Document #{index + 1}</span>
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-primary hover:underline font-bold inline-flex items-center gap-0.5"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verification decision form */}
            <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-slate-850">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">Administrative Actions</h4>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-355 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-450 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold">Investigation Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="OPEN">OPEN - Reviewing logs</option>
                    <option value="INVESTIGATING">INVESTIGATING - Under Audit</option>
                    <option value="RESOLVED">RESOLVED - Case Closed (Score adjusted)</option>
                    <option value="DISMISSED">DISMISSED - Dismiss Case</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold font-bold">Administrative Resolution note</label>
                  <input
                    type="text"
                    placeholder="e.g. Audit logs verified. Funds properly accounted for."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="h-4.5 w-4.5" />
                {loading ? "Resolving dispute..." : "Commit Administrative Decisions"}
              </button>
            </form>

          </div>
        )}
      </div>

    </div>
  );
}
