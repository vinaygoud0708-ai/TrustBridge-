"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Award,
  ExternalLink,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocItem {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: string;
  uploadedAt: Date | string;
}

interface OrganizationItem {
  id: string;
  name: string;
  description: string;
  registrationNumber: string;
  taxId: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIFSC: string;
  address: string;
  city: string;
  country: string;
  status: string;
  verificationTier: string;
  trustScore: number;
  documents: DocItem[];
  user: {
    name: string;
    email: string;
  };
}

interface VerificationDashboardProps {
  organizations: OrganizationItem[];
}

export default function VerificationDashboard({ organizations }: VerificationDashboardProps) {
  const router = useRouter();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [status, setStatus] = useState("APPROVED");
  const [tier, setTier] = useState("BRONZE");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const org = organizations.find((o) => o.id === selectedOrgId);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!selectedOrgId) {
      setError("Please select an organization to audit.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/verifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: selectedOrgId,
          status,
          verificationTier: tier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update organization");
      }

      setSuccess("NGO status and verification tier updated successfully.");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      
      {/* NGO List Panel (Col Span 4) */}
      <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-2xl h-fit space-y-4">
        <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2">
          NGO Registrations
        </h3>

        {organizations.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-slate-855 rounded-2xl">
            <span className="text-xs text-slate-500 italic">No NGO profiles registered.</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {organizations.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setSelectedOrgId(o.id);
                  setStatus(o.status);
                  setTier(o.verificationTier);
                  setError("");
                  setSuccess("");
                }}
                className={cn(
                  "w-full p-4 rounded-2xl border transition-all text-left block space-y-2",
                  selectedOrgId === o.id
                    ? "bg-primary/10 border-primary text-white"
                    : "bg-slate-905 border-slate-850 hover:bg-slate-800/30 text-slate-300"
                )}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs truncate max-w-[130px]">{o.name}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-extrabold",
                    o.status === "APPROVED" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                    o.status === "PENDING" && "bg-amber-500/10 text-amber-450 border border-amber-500/20",
                    o.status === "REJECTED" && "bg-rose-500/10 text-rose-550 border border-rose-500/20",
                    o.status === "SUSPENDED" && "bg-slate-800 text-slate-400 border border-slate-700"
                  )}>
                    {o.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-500">
                  <span>Tier: {o.verificationTier}</span>
                  <span>Score: {o.trustScore.toFixed(1)}/5.0</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details & Actions Panel (Col Span 8) */}
      <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {!org ? (
          <div className="py-20 text-center border border-dashed border-slate-850 rounded-2xl flex flex-col justify-center items-center">
            <Users className="h-8 w-8 text-slate-650 mb-3" />
            <span className="text-xs text-slate-500 italic">Select an NGO registration profile to perform credentials verification audits.</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="border-b border-slate-850 pb-4">
              <h2 className="text-base font-black text-white">{org.name}</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{org.description}</p>
              
              <div className="mt-3.5 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-slate-500 font-semibold">
                <span>Founder: <strong className="text-white">{org.user.name}</strong> ({org.user.email})</span>
                <span>Location: <strong className="text-white">{org.city}, {org.country}</strong></span>
              </div>
            </div>

            {/* Document list */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" /> Submitted Legal Documentation
              </h4>

              {org.documents.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-slate-850 rounded-xl">
                  <span className="text-xs text-slate-500 italic">No legal credentials uploaded yet.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {org.documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex justify-between items-center text-xs"
                    >
                      <div className="max-w-[170px]">
                        <span className="font-bold text-white block truncate">{doc.fileName}</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">{doc.type}</span>
                      </div>
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-primary hover:underline font-bold inline-flex items-center gap-0.5 flex-shrink-0"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Banking Details */}
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">Banking Details Router</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] text-slate-450">
                <div>
                  <span className="block text-slate-500 uppercase font-bold">Account Name</span>
                  <strong className="text-white text-xs block mt-0.5">{org.bankAccountName}</strong>
                </div>
                <div>
                  <span className="block text-slate-500 uppercase font-bold">Account Number</span>
                  <strong className="text-white text-xs block mt-0.5">{org.bankAccountNumber}</strong>
                </div>
                <div>
                  <span className="block text-slate-500 uppercase font-bold">IFSC / Routing Code</span>
                  <strong className="text-white text-xs block mt-0.5">{org.bankIFSC}</strong>
                </div>
              </div>
            </div>

            {/* Verification decision form */}
            <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-slate-850">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">Administrative Decision</h4>
              
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-450 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold">Approval Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="PENDING">PENDING - Under Review</option>
                    <option value="APPROVED">APPROVED - Fully Verified</option>
                    <option value="REJECTED">REJECTED - Application Denied</option>
                    <option value="SUSPENDED">SUSPENDED - Account Frozen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold font-bold flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-primary" /> Verification Tier
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="BRONZE">BRONZE Tier (+10 points)</option>
                    <option value="SILVER">SILVER Tier (+20 points)</option>
                    <option value="GOLD">GOLD Tier (+30 points)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="h-4.5 w-4.5" />
                {loading ? "Processing..." : "Commit Verification Decision"}
              </button>
            </form>

          </div>
        )}
      </div>

    </div>
  );
}
