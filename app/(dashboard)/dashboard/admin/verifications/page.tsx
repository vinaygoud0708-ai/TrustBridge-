import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import VerificationDashboard from "@/components/admin/verification-dashboard";

export default async function AdminVerificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all registered organization profiles for validation
  const organizations = await prisma.organization.findMany({
    include: {
      documents: {
        orderBy: { uploadedAt: "desc" },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Back link */}
      <div>
        <Link 
          href="/dashboard/admin" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-455 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Overview
        </Link>
      </div>

      {/* Head */}
      <div>
        <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Credentials Auditor
        </span>
        <h1 className="text-xl font-black text-white mt-1">NGO Verifications Console</h1>
        <p className="text-xs text-slate-400 mt-1">Verify registration certificate deeds, assess compliance risks, and authorize platform listings.</p>
      </div>

      {/* Render Dashboard Component */}
      <VerificationDashboard organizations={organizations} />

    </div>
  );
}
