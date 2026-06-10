import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import SettingsPanel from "@/components/charity/settings-panel";

export default async function CharitySettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.orgId) {
    redirect("/login");
  }

  const orgId = session.user.orgId;

  // Fetch organization profile
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  });

  if (!org) {
    redirect("/register/charity");
  }

  // Fetch verification documents uploaded
  const documents = await prisma.document.findMany({
    where: { organizationId: orgId },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Back link */}
      <div>
        <Link 
          href="/dashboard/charity" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-455 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Title */}
      <div>
        <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1">
          <Settings className="h-3 w-3" /> Partner Configuration
        </span>
        <h1 className="text-xl font-black text-white mt-1">Profile & Verification Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Edit public information, update bank accounts, and manage verification files.</p>
      </div>

      {/* Render Settings Panel */}
      <SettingsPanel initialOrg={org} initialDocs={documents} />

    </div>
  );
}
