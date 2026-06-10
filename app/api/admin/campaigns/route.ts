import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { recalculateTrustScore } from "@/lib/trust-score";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { campaignId, status, adminNote, isFeatured, isUrgent } = body;

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    // Prepare update payload
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isUrgent !== undefined) updateData.isUrgent = isUrgent;

    // Update campaign
    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: updateData,
    });

    // Recalculate organization trust score (completion score might change)
    await recalculateTrustScore(campaign.organizationId);

    // Notify organization owner
    const org = await prisma.organization.findUnique({
      where: { id: campaign.organizationId },
    });

    if (org) {
      await prisma.notification.create({
        data: {
          userId: org.userId,
          title: `Campaign Status Update: ${campaign.title}`,
          message: `Campaign status updated to ${status}. Admin Note: ${adminNote || "None"}.`,
          type: "UPDATE",
          link: `/dashboard/charity/campaigns`,
        },
      });
    }

    // Log administrative action
    await prisma.auditLog.create({
      data: {
        performedBy: session.user.email || "admin",
        action: "UPDATE_CAMPAIGN_STATUS",
        targetType: "CAMPAIGN",
        targetId: campaignId,
        details: JSON.stringify({ status, isFeatured, isUrgent, adminNote }),
      },
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error("Error updating campaign status:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
