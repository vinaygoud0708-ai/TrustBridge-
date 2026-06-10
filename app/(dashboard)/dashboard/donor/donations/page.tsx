import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DonationHistoryList from "@/components/donor/donation-history-list";

export const revalidate = 0; // Fresh queries

export default async function DonorDonationHistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  let donations: any[] = [];
  try {
    donations = await prisma.donation.findMany({
      where: { donorId: session.user.id },
      include: {
        campaign: {
          select: {
            title: true,
            organization: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching donor donations ledger:", error);
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight font-sans">Donation Ledger</h1>
        <p className="text-xs text-slate-450 mt-1">Audit complete receipts history and download official tax summary files.</p>
      </div>

      <DonationHistoryList donations={donations} />
    </div>
  );
}
