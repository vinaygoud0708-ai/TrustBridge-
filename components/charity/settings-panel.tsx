"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Building,
  CreditCard,
  Globe,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrgProfile {
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
  website: string | null;
  logo: string | null;
}

interface DocItem {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: string;
  uploadedAt: Date | string;
}

interface SettingsPanelProps {
  initialOrg: OrgProfile;
  initialDocs: DocItem[];
}

export default function SettingsPanel({ initialOrg, initialDocs }: SettingsPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "documents">("profile");
  
  // Profile forms states
  const [description, setDescription] = useState(initialOrg.description);
  const [website, setWebsite] = useState(initialOrg.website || "");
  const [logo, setLogo] = useState(initialOrg.logo || "");
  const [address, setAddress] = useState(initialOrg.address);
  const [city, setCity] = useState(initialOrg.city);
  const [country, setCountry] = useState(initialOrg.country);
  const [bankAccountName, setBankAccountName] = useState(initialOrg.bankAccountName);
  const [bankAccountNumber, setBankAccountNumber] = useState(initialOrg.bankAccountNumber);
  const [bankIFSC, setBankIFSC] = useState(initialOrg.bankIFSC);

  // Document states
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [docType, setDocType] = useState("REGISTRATION");
  const [docFileName, setDocFileName] = useState("");
  const [docFileUrl, setDocFileUrl] = useState("");

  // UI state feedback
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [docError, setDocError] = useState("");
  const [docSuccess, setDocSuccess] = useState("");
  const [docLoading, setDocLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      const response = await fetch("/api/organizations/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          website,
          logo,
          address,
          city,
          country,
          bankAccountName,
          bankAccountNumber,
          bankIFSC,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfileSuccess("NGO profile and bank credentials updated successfully.");
      router.refresh();
    } catch (err: any) {
      setProfileError(err.message || "An error occurred");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocError("");
    setDocSuccess("");
    setDocLoading(true);

    if (!docFileName) {
      setDocError("Please enter a file name.");
      setDocLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/organizations/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: docType,
          fileName: docFileName,
          fileUrl: docFileUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to log document");
      }

      setDocs([data.document, ...docs]);
      setDocFileName("");
      setDocFileUrl("");
      setDocSuccess("Document submitted successfully. Administrators will review it.");
      router.refresh();
    } catch (err: any) {
      setDocError(err.message || "An error occurred");
    } finally {
      setDocLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Settings Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5",
            activeTab === "profile" 
              ? "border-primary text-white" 
              : "border-transparent text-slate-500 hover:text-slate-300"
          )}
        >
          <Settings className="h-4 w-4" /> Profile & Banking
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={cn(
            "px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5",
            activeTab === "documents" 
              ? "border-primary text-white" 
              : "border-transparent text-slate-500 hover:text-slate-300"
          )}
        >
          <FileText className="h-4 w-4" /> Verification Documents
        </button>
      </div>

      {/* Tab 1: Profile Info */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSubmit} className="space-y-8 max-w-4xl">
          {profileError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 flex-shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {/* Core Info */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-1.5">
              <Building className="h-4 w-4 text-primary" /> Core NGO Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Organization Name</label>
                <input
                  type="text"
                  value={initialOrg.name}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-500 cursor-not-allowed"
                  disabled
                />
                <span className="text-[9px] text-slate-600 block mt-1">To change your legal name, open an administrator support request.</span>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Website Domain</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-650" />
                  <input
                    type="url"
                    placeholder="https://myngo.org"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-655 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Short Mission Description *</label>
              <textarea
                rows={3}
                placeholder="Briefly state your charity's focus, mission statement, and target communities."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors resize-y"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Logo URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Legal registration status (Read-Only) */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-slate-400" /> Registration & Exemption (Verified)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Government Registration #</label>
                <input
                  type="text"
                  value={initialOrg.registrationNumber}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-500 cursor-not-allowed"
                  disabled
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Tax-exempt Certificate ID (Tax ID)</label>
                <input
                  type="text"
                  value={initialOrg.taxId}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-500 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Geographic Address */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-rose-400" /> Headquarters Location
            </h3>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Full Address *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-750 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Country *</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-750 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Banking details */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-emerald-450" /> Banking Credentials (Disbursements Router)
            </h3>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-slate-400 text-[10px] leading-relaxed">
              Escrow funds are routed to this account. Ensure details match registered incorporation records.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Account Beneficiary *</label>
                <input
                  type="text"
                  placeholder="e.g. Hope Education Foundation"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-750 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Account Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 5020001234567"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-750 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">IFSC / Routing Code *</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0000123"
                  value={bankIFSC}
                  onChange={(e) => setBankIFSC(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-750 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {profileLoading ? "Saving Profile..." : "Save Settings Changes"}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Document Verification list */}
      {activeTab === "documents" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 text-left max-w-6xl">
          
          {/* Uploader Form (Col Span 2) */}
          <form onSubmit={handleDocSubmit} className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 h-fit">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2">
              Submit Verification Attachment
            </h3>

            {docError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                <span>{docError}</span>
              </div>
            )}

            {docSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-450 flex-shrink-0" />
                <span>{docSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold">Document Category *</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="REGISTRATION">Government Registration Deed</option>
                <option value="TAX">Tax exemption documentation</option>
                <option value="BANK">Cancelled Cheque / Bank credentials</option>
                <option value="IDENTITY">Founder Identity proof</option>
                <option value="OTHER">Other Credentials</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold">File Label / Filename *</label>
              <input
                type="text"
                placeholder="e.g. Charity_Certificate_2026.pdf"
                value={docFileName}
                onChange={(e) => setDocFileName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-750 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bold">Public File URL</label>
              <input
                type="url"
                placeholder="e.g. https://myngo.org/docs/..."
                value={docFileUrl}
                onChange={(e) => setDocFileUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-750 focus:outline-none focus:border-primary transition-colors"
              />
              <span className="text-[10px] text-slate-550 block mt-1">Direct file link. Defaults to a mock template document on empty.</span>
            </div>

            <button
              type="submit"
              disabled={docLoading}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              <Upload className="h-4.5 w-4.5" />
              {docLoading ? "Uploading..." : "Submit File"}
            </button>
          </form>

          {/* Documents status list (Col Span 3) */}
          <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-2">
              Active Verification Attachments
            </h3>

            {docs.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-850 rounded-2xl">
                <span className="text-xs text-slate-500 italic">No legal credentials uploaded yet.</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                {docs.map((doc) => (
                  <div 
                    key={doc.id}
                    className="p-4 rounded-xl bg-slate-905 border border-slate-850 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{doc.fileName}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{doc.type} • Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold border inline-flex items-center gap-0.5",
                        doc.status === "APPROVED" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                        doc.status === "PENDING" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                        doc.status === "REJECTED" && "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      )}>
                        {doc.status === "APPROVED" && <CheckCircle2 className="h-2.5 w-2.5" />}
                        {doc.status === "PENDING" && <Clock className="h-2.5 w-2.5" />}
                        {doc.status === "REJECTED" && <XCircle className="h-2.5 w-2.5" />}
                        {doc.status}
                      </span>
                      
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-primary hover:underline font-bold text-[10px]"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
