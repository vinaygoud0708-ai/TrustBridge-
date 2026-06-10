import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CHARITY") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!session.user.orgId) {
      return NextResponse.json({ error: "No organization profile associated" }, { status: 400 });
    }

    const orgId = session.user.orgId;
    const body = await req.json();
    const { campaignId, requestedAmount, purpose } = body;

    if (!campaignId || !requestedAmount || !purpose) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const amount = parseFloat(requestedAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Requested amount must be positive" }, { status: 400 });
    }

    // Verify campaign ownership and status
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        organizationId: orgId,
      },
      include: {
        withdrawals: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found or access restricted" }, { status: 404 });
    }

    // Check organization approval status
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org || org.status !== "APPROVED") {
      return NextResponse.json({ error: "Your organization must be approved by administrators to withdraw funds." }, { status: 403 });
    }

    // Calculate remaining escrow balance for this campaign
    const totalRaised = campaign.raisedAmount;
    const totalWithdrawn = campaign.withdrawals
      .filter(w => w.status === "DISBURSED" || w.status === "APPROVED" || w.status === "PENDING")
      .reduce((sum, w) => sum + w.requestedAmount, 0);

    const availableEscrow = Math.max(0, totalRaised - totalWithdrawn);

    if (amount > availableEscrow) {
      return NextResponse.json({
        error: `Requested amount exceeds available campaign escrow balance. Available: $${availableEscrow.toFixed(2)} (including pending requests).`,
      }, { status: 400 });
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        campaignId,
        organizationId: orgId,
        requestedAmount: amount,
        purpose,
        status: "PENDING",
      },
    });

    // Notify administrators
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "New Escrow Withdrawal Request",
          message: `${org.name} requested $${amount} from "${campaign.title}".`,
          type: "WITHDRAWAL",
          link: `/dashboard/admin/withdrawals`,
        },
      });
    }

    return NextResponse.json({ success: true, withdrawal });
  } catch (error: any) {
    console.error("Error creating withdrawal request:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
