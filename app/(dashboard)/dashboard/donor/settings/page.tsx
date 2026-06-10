import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SettingsForms from "@/components/donor/settings-forms";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function DonorSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  let user: any = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });
  } catch (error) {
    console.error("Error fetching user details for settings:", error);
  }

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6 text-left font-sans">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-455 mt-1">Configure profile details, modify password parameters, and manage notification preferences.</p>
      </div>

      <SettingsForms user={user} />
    </div>
  );
}
