"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Info, FileText, Landmark, UserCheck, AlertTriangle, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

interface DocumentUpload {
  type: string;
  fileName: string;
  fileUrl: string;
}

export default function CharityRegistrationWizard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // Redirect if not authenticated or not charity
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "CHARITY") {
      router.push("/");
    }
  }, [status, session, router]);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  // Step 1: Basic Info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");

  // Step 2: Legal Details & Banking
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIFSC, setBankIFSC] = useState("");

  // Step 2: Documents list (simulated uploads)
  const [uploadedDocs, setUploadedDocs] = useState<DocumentUpload[]>([]);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const simulateDocUpload = (type: string, fileName: string) => {
    setUploadingType(type);
    setUploadProgress(10);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Generate mock file URL
            const fileUrl = type === "IDENTITY"
              ? "https://res.cloudinary.com/demo/image/upload/v1570975200/sample.jpg"
              : "https://res.cloudinary.com/demo/image/upload/v1570975200/sample.pdf";
            
            // Filter old upload of same type
            setUploadedDocs((prevDocs) => [
              ...prevDocs.filter((d) => d.type !== type),
              { type, fileName, fileUrl }
            ]);
            setUploadingType(null);
          }, 300);
          return 100;
        }
        return prev + 30;
      });
    }, 150);
  };

  const getDocName = (type: string) => {
    return uploadedDocs.find((d) => d.type === type)?.fileName || null;
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    // Final checks
    if (uploadedDocs.length < 2) {
      setError("Please upload at least two verification documents (e.g. Registration and Tax Certificates).");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        description,
        registrationNumber,
        taxId,
        bankAccountName,
        bankAccountNumber,
        bankIFSC,
        address,
        city,
        country,
        website: website || null,
        logo: logo || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=120&auto=format&fit=crop&q=80",
        documents: uploadedDocs
      };

      const res = await fetch("/api/organizations/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application.");
      }

      // Update session locally to capture newly created organization ID (or simply notify session)
      await update({ orgId: data.organizationId });

      setStep(4); // Success step
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-slate-500">
        <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-12 text-slate-300 text-left">
        
        {/* Step indicators */}
        {step < 4 && (
          <div className="mb-10">
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
              <span className={cn(step >= 1 && "text-primary")}>1. General Profile</span>
              <span className={cn(step >= 2 && "text-primary")}>2. Legal & Bank Docs</span>
              <span className={cn(step >= 3 && "text-primary")}>3. Final Verification</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Wizard Box */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 blur-2xl rounded-full" />

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" /> Step 1: NGO General Profile
                </h2>
                <p className="text-xs text-slate-450 mt-1">Specify public information about your organization.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Organization Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Hope Education Foundation"
                    className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mission Statement & Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed summary of your organization's core operations, goals, and history..."
                    rows={4}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary w-full resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Website Address (Optional)</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://hope-edu.org"
                      className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Logo Image Link (Optional)</label>
                    <input
                      type="url"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Street Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="450 Broadway St, Suite 10"
                    className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Country</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="United States"
                      className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation button */}
              <div className="pt-4 border-t border-slate-850 flex justify-end">
                <button
                  onClick={() => {
                    if (name.trim() && description.trim() && address.trim() && city.trim() && country.trim()) {
                      setStep(2);
                      setError(null);
                    } else {
                      setError("Please fill in all required profile fields.");
                    }
                  }}
                  className="bg-gradient-to-r from-primary to-secondary text-xs font-bold text-white px-5 py-2.5 rounded-xl hover:opacity-95 flex items-center gap-1 hover:-translate-y-0.5 transition-all transform"
                >
                  Continue to Step 2 <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Legal Details & Documents */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-secondary" /> Step 2: Legal Vetting & Bank Credentials
                </h2>
                <p className="text-xs text-slate-450 mt-1">Provide government registration keys, bank details, and upload PDF certificates.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Registration Number</label>
                    <input
                      type="text"
                      required
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="NGO-EDU-2021-9988"
                      className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tax Exemption ID (501c3 / 80G)</label>
                    <input
                      type="text"
                      required
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="TAX-EXEMPT-EDU-501C3"
                      className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-primary w-full"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-850 space-y-4">
                  <span className="text-[10px] text-secondary uppercase font-bold tracking-wider block">Official Bank Coordinates</span>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-medium">Bank Account Name</label>
                    <input
                      type="text"
                      required
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="Hope Education Foundation Inc"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-400 font-medium">Account Number</label>
                      <input
                        type="text"
                        required
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        placeholder="10984758392"
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-slate-400 font-medium">IFSC / Sort Code / SWIFT</label>
                      <input
                        type="text"
                        required
                        value={bankIFSC}
                        onChange={(e) => setBankIFSC(e.target.value)}
                        placeholder="CHASE000129"
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Simulated Document Upload Dropzones */}
                <div className="space-y-4 pt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Legal Document Uploads (PDF/JPG)</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Reg Certificate */}
                    <div className="p-4 bg-slate-950/45 border border-slate-850 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold text-white block">Registration Certificate</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          {getDocName("REGISTRATION") || "No file uploaded"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => simulateDocUpload("REGISTRATION", "Registration_Certificate.pdf")}
                        className="bg-slate-800 text-[10px] font-bold text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 hover:text-white"
                        disabled={uploadingType === "REGISTRATION"}
                      >
                        {uploadingType === "REGISTRATION" ? `Uploading ${uploadProgress}%` : "Upload"}
                      </button>
                    </div>

                    {/* Tax Exemption Certificate */}
                    <div className="p-4 bg-slate-950/45 border border-slate-850 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold text-white block">Tax Exemption Cert</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          {getDocName("TAX") || "No file uploaded"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => simulateDocUpload("TAX", "Tax_Exemption_Certificate.pdf")}
                        className="bg-slate-800 text-[10px] font-bold text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 hover:text-white"
                        disabled={uploadingType === "TAX"}
                      >
                        {uploadingType === "TAX" ? `Uploading ${uploadProgress}%` : "Upload"}
                      </button>
                    </div>

                    {/* Bank Account Statement */}
                    <div className="p-4 bg-slate-950/45 border border-slate-850 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold text-white block">Bank Account Statement</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          {getDocName("BANK") || "No file uploaded"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => simulateDocUpload("BANK", "Bank_Account_Verification.pdf")}
                        className="bg-slate-800 text-[10px] font-bold text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 hover:text-white"
                        disabled={uploadingType === "BANK"}
                      >
                        {uploadingType === "BANK" ? `Uploading ${uploadProgress}%` : "Upload"}
                      </button>
                    </div>

                    {/* Founder ID */}
                    <div className="p-4 bg-slate-950/45 border border-slate-850 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold text-white block">Founder Identity ID</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          {getDocName("IDENTITY") || "No file uploaded"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => simulateDocUpload("IDENTITY", "Founder_ID_Passport.jpg")}
                        className="bg-slate-800 text-[10px] font-bold text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 hover:text-white"
                        disabled={uploadingType === "IDENTITY"}
                      >
                        {uploadingType === "IDENTITY" ? `Uploading ${uploadProgress}%` : "Upload"}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Navigation button */}
              <div className="pt-4 border-t border-slate-850 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 border border-slate-800 hover:bg-slate-800/40 rounded-xl text-slate-400 text-xs font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Go Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (registrationNumber.trim() && taxId.trim() && bankAccountName.trim() && bankAccountNumber.trim() && bankIFSC.trim()) {
                      if (uploadedDocs.length < 2) {
                        setError("Please upload at least 2 verification files to proceed.");
                      } else {
                        setStep(3);
                        setError(null);
                      }
                    } else {
                      setError("Please complete all registration ID and banking fields.");
                    }
                  }}
                  className="bg-gradient-to-r from-primary to-secondary text-xs font-bold text-white px-5 py-2.5 rounded-xl hover:opacity-95 flex items-center gap-1 hover:-translate-y-0.5 transition-all transform"
                >
                  Continue to Review <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review and Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-400" /> Step 3: Review Details & Submit
                </h2>
                <p className="text-xs text-slate-450 mt-1">Review NGO registration summary details before finalizing submission.</p>
              </div>

              {/* Display errors */}
              {error && (
                <div className="p-3 bg-danger/10 border border-danger/25 text-danger text-xs font-semibold rounded-xl text-center leading-normal">
                  {error}
                </div>
              )}

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 divide-y divide-slate-850">
                <div className="pb-3 text-xs space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">NGO Name & Website</span>
                  <span className="font-extrabold text-white text-sm block">{name}</span>
                  {website && <span className="text-primary block">{website}</span>}
                </div>

                <div className="py-3 text-xs space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Vetting Keys</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500">Reg Number:</span>
                      <span className="font-semibold text-slate-200 block">{registrationNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Tax ID:</span>
                      <span className="font-semibold text-slate-200 block">{taxId}</span>
                    </div>
                  </div>
                </div>

                <div className="py-3 text-xs space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Direct Bank Coordinates</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-900">
                    <div>
                      <span className="text-[10px] text-slate-500">Account Name:</span>
                      <span className="font-semibold text-slate-300 block">{bankAccountName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Account Number:</span>
                      <span className="font-semibold text-slate-350 block">{bankAccountNumber}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-slate-500">IFSC Code:</span>
                      <span className="font-semibold text-slate-350 block">{bankIFSC}</span>
                    </div>
                  </div>
                </div>

                <div className="py-3 text-xs space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Uploaded Documents ({uploadedDocs.length})</span>
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {uploadedDocs.map((d) => (
                      <span key={d.type} className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-bold">
                        {d.type}: {d.fileName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation button */}
              <div className="pt-4 border-t border-slate-850 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 border border-slate-800 hover:bg-slate-800/40 rounded-xl text-slate-400 text-xs font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Go Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-xs font-bold text-white px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transform transition-all hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="h-4.5 w-4.5 fill-white/10" /> Submit Application
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success Message */}
          {step === 4 && (
            <div className="space-y-6 text-center py-6">
              <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-white">Application Submitted!</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Your NGO registration coordinates and legal certificates have been saved. Our trust administrators will audit your submission within 48 hours.
                </p>
              </div>

              <div className="p-4 bg-slate-950/65 rounded-2xl border border-slate-850 text-left max-w-md mx-auto space-y-1.5 text-xs text-slate-400">
                <div className="flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>Your account status is currently: <strong>PENDING REVIEW</strong>.</span>
                </div>
                <div className="flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Once verified, you will be assigned a verification tier (Bronze/Silver/Gold) and can begin posting campaigns.</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-850 max-w-md mx-auto">
                <Link
                  href="/dashboard/charity"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white py-3 rounded-xl border border-slate-700 block text-center transition-colors"
                >
                  Go to Charity Dashboard
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
