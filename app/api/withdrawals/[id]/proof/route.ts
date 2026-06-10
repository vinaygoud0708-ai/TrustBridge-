import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: withdrawalRequestId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CHARITY") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Fetch withdrawal request and verify ownership
    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalRequestId },
      include: { campaign: true },
    });

    if (!withdrawal || withdrawal.organizationId !== session.user.orgId) {
      return NextResponse.json({ error: "Withdrawal request not found or access denied" }, { status: 403 });
    }

    if (withdrawal.status !== "DISBURSED") {
      return NextResponse.json({ error: "Proofs can only be uploaded for DISBURSED withdrawals." }, { status: 400 });
    }

    const body = await req.json();
    const { item, description, amount, proofType, proofFileUrl } = body;

    if (!item || !description || !amount || !proofType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    // Save fund usage record
    const fundUsage = await prisma.fundUsage.create({
      data: {
        campaignId: withdrawal.campaignId,
        withdrawalRequestId,
        item,
        description,
        amount: parsedAmount,
        proofType,
        proofFileUrl: proofFileUrl || "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=800&q=80",
        status: "PENDING", // Admins will verify the invoice
      },
    });

    // Mark withdrawal request as having proof uploaded
    await prisma.withdrawalRequest.update({
      where: { id: withdrawalRequestId },
      data: { proofUploaded: true },
    });

    // Notify administrators to audit the invoice
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "New Fund Usage Proof Uploaded",
          message: `Receipt of $${parsedAmount} logged for campaign "${withdrawal.campaign.title}".`,
          type: "PROOF",
          link: `/dashboard/admin/withdrawals`,
        },
      });
    }

    return NextResponse.json({ success: true, fundUsage });
  } catch (error: any) {
    console.error("Error logging fund usage proof:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
