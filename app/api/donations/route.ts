import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const stripePaymentId = searchParams.get("stripePaymentId");
    const campaignId = searchParams.get("campaignId");

    // 1. If searching by stripePaymentId, expose globally (needed by receipt success pages)
    if (stripePaymentId) {
      const donation = await prisma.donation.findUnique({
        where: { stripePaymentId },
        select: {
          id: true,
          amount: true,
          status: true,
          receiptUrl: true,
          stripePaymentId: true,
        }
      });
      return NextResponse.json(donation ? [donation] : []);
    }

    // 2. Otherwise, check session permissions
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause: any = {};

    // Filter by campaign
    if (campaignId) {
      whereClause.campaignId = campaignId;
    }

    // Role-based restrictions
    if (session.user.role === "DONOR") {
      // Donors see only their own donations
      whereClause.donorId = session.user.id;
    } else if (session.user.role === "CHARITY") {
      // Charities see only donations on their campaigns
      if (!session.user.orgId) {
        return NextResponse.json([]);
      }
      whereClause.campaign = {
        organizationId: session.user.orgId,
      };
    } // Admins see all

    const donations = await prisma.donation.findMany({
      where: whereClause,
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

    return NextResponse.json(donations);
  } catch (error) {
    console.error("GET_DONATIONS_API_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
