import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Users, Calendar, Mail, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organization: {
        select: { name: true, verificationTier: true },
      },
    },
  });

  const totalUsers = users.length;
  const donorCount = users.filter(u => u.role === "DONOR").length;
  const charityCount = users.filter(u => u.role === "CHARITY").length;
  const adminCount = users.filter(u => u.role === "ADMIN").length;

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
          <Users className="h-3.5 w-3.5" /> Identity Auditing
        </span>
        <h1 className="text-xl font-black text-white mt-1">Platform Users & Roles</h1>
        <p className="text-xs text-slate-400 mt-1">Registry of registered donor accounts, NGO representatives, and administrative coordinators.</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-905 border border-slate-850 rounded-2xl">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Total Users</span>
          <span className="text-lg font-black text-white mt-1 block">{totalUsers}</span>
        </div>
        <div className="p-4 bg-slate-905 border border-slate-850 rounded-2xl">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Donors</span>
          <span className="text-lg font-black text-white mt-1 block">{donorCount}</span>
        </div>
        <div className="p-4 bg-slate-905 border border-slate-850 rounded-2xl">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">NGO Partners</span>
          <span className="text-lg font-black text-white mt-1 block">{charityCount}</span>
        </div>
        <div className="p-4 bg-slate-905 border border-slate-850 rounded-2xl">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Administrators</span>
          <span className="text-lg font-black text-primary mt-1 block">{adminCount}</span>
        </div>
      </div>

      {/* Users list */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-slate-850 pb-3 mb-4">
          Registered Accounts ({users.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-400">
            <thead>
              <tr className="border-b border-slate-800 pb-3 text-slate-505 text-[10px] uppercase font-bold tracking-wider text-left">
                <th className="py-3 px-2">User Name</th>
                <th className="py-3 px-2">Role</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Auth Status</th>
                <th className="py-3 px-2 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-805/40">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/10 transition-all">
                  <td className="py-3.5 px-2">
                    <div>
                      <span className="font-bold text-white block">{u.name}</span>
                      {u.organization && (
                        <span className="text-[9px] text-slate-500 block mt-0.5">Org: {u.organization.name} ({u.organization.verificationTier})</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-extrabold border",
                      u.role === "ADMIN" && "bg-primary/10 text-primary border-primary/20",
                      u.role === "CHARITY" && "bg-amber-500/10 text-amber-450 border border-amber-500/20",
                      u.role === "DONOR" && "bg-slate-800 text-slate-400 border border-slate-700"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-2">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-350">
                      <Mail className="h-3.5 w-3.5 text-slate-655" />
                      {u.email}
                    </span>
                  </td>
                  <td className="py-3.5 px-2">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-bold inline-flex items-center gap-0.5",
                      u.isVerified ? "text-emerald-400" : "text-slate-500"
                    )}>
                      {u.isVerified ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                      {u.isVerified ? "OTP Verified" : "Pending OTP"}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-right text-slate-500 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
