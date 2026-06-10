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
    const { withdrawalId, status, adminNote } = body;

    if (!withdrawalId || !status) {
      return NextResponse.json({ error: "Withdrawal ID and target status are required" }, { status: 400 });
    }

    // Fetch withdrawal request
    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: { campaign: true },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    const updateData: any = { status };
    if (adminNote) updateData.adminNote = adminNote;
    if (status === "DISBURSED") {
      updateData.disbursedAt = new Date();
    } else if (status === "APPROVED") {
      updateData.processedAt = new Date();
    }

    // Update withdrawal request
    const updatedWithdrawal = await prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: updateData,
    });

    // If disbursing, log platform transaction ledger
    if (status === "DISBURSED") {
      await prisma.transaction.create({
        data: {
          type: "WITHDRAWAL",
          amount: withdrawal.requestedAmount,
          currency: "USD",
          status: "SUCCESS",
          reference: `WD-${withdrawalId.substring(0, 8)}-${Date.now().toString().slice(-4)}`,
          metadata: JSON.stringify({ campaignId: withdrawal.campaignId, organizationId: withdrawal.organizationId }),
        },
      });
    }

    // Recalculate trust score (reporting score changes due to new completed disbursement)
    await recalculateTrustScore(withdrawal.organizationId);

    // Notify organization members
    const org = await prisma.organization.findUnique({
      where: { id: withdrawal.organizationId },
    });

    if (org) {
      await prisma.notification.create({
        data: {
          userId: org.userId,
          title: `Withdrawal Request: ${status}`,
          message: `Your disbursement request for $${withdrawal.requestedAmount} from "${withdrawal.campaign.title}" was ${status}. Admin Note: ${adminNote || "None"}.`,
          type: "WITHDRAWAL",
          link: `/dashboard/charity/withdraw`,
        },
      });
    }

    // Log the audit
    await prisma.auditLog.create({
      data: {
        performedBy: session.user.email || "admin",
        action: `WITHDRAWAL_${status}`,
        targetType: "WITHDRAWAL_REQUEST",
        targetId: withdrawalId,
        details: JSON.stringify({ status, adminNote }),
      },
    });

    return NextResponse.json({ success: true, withdrawal: updatedWithdrawal });
  } catch (error: any) {
    console.error("Error processing withdrawal request:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  // Verifying fund usages (invoice approval)
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { fundUsageId, status } = body; // status = 'VERIFIED'

    if (!fundUsageId || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const fundUsage = await prisma.fundUsage.update({
      where: { id: fundUsageId },
      data: { status },
    });

    // Recalculate score (onTimeReports changes)
    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: fundUsage.withdrawalRequestId },
    });
    
    if (withdrawal) {
      await recalculateTrustScore(withdrawal.organizationId);
    }

    return NextResponse.json({ success: true, fundUsage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
