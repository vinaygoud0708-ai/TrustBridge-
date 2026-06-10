import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ImpactCharts from "@/components/donor/impact-charts";

export const revalidate = 0; // Fresh calculations

export default async function DonorImpactPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  let totalDonated = 0;
  let totalBeneficiaries = 0;
  let completedCampaignsCount = 0;
  const categoryMap = new Map<string, number>();

  try {
    // Fetch all successful donations of this user
    const donations = await prisma.donation.findMany({
      where: { donorId: session.user.id, status: "SUCCESS" },
      include: {
        campaign: true,
      },
    });

    totalDonated = donations.reduce((acc, d) => acc + d.amount, 0);

    // Group by unique campaigns to count beneficiaries and completed projects
    const campaignsMap = new Map();
    donations.forEach((d) => {
      campaignsMap.set(d.campaign.id, d.campaign);
      
      // Aggregate by category
      const currentCatVal = categoryMap.get(d.campaign.category) || 0;
      categoryMap.set(d.campaign.category, currentCatVal + d.amount);
    });

    const uniqueCampaigns = Array.from(campaignsMap.values());
    
    totalBeneficiaries = uniqueCampaigns.reduce((acc, c) => acc + c.beneficiaryCount, 0);
    completedCampaignsCount = uniqueCampaigns.filter((c) => c.status === "COMPLETED").length;

  } catch (error) {
    console.error("Error calculating donor impact metrics:", error);
  }

  // Format category map for Recharts
  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(),
    value,
  }));

  // Fallback default value if no contributions yet
  if (categoryData.length === 0) {
    categoryData.push({ name: "General Support", value: 1.0 });
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight font-sans">Impact Dashboard</h1>
        <p className="text-xs text-slate-450 mt-1">Audit the tangible changes funded by your digital contributions.</p>
      </div>

      <ImpactCharts
        categoryData={categoryData}
        totalDonated={totalDonated}
        totalBeneficiaries={totalBeneficiaries}
        completedCampaignsCount={completedCampaignsCount}
      />
    </div>
  );
}
