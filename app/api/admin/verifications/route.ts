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
    const { organizationId, status, verificationTier } = body;

    if (!organizationId || !status || !verificationTier) {
      return NextResponse.json({ error: "Missing organization validation parameters" }, { status: 400 });
    }

    // Update organization status and tier
    const org = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        status,
        verificationTier,
      },
    });

    // If approved, update associated pending documents
    if (status === "APPROVED") {
      await prisma.document.updateMany({
        where: { organizationId, status: "PENDING" },
        data: { status: "APPROVED" },
      });
    }

    // Trigger trust score engine recalculation
    await recalculateTrustScore(organizationId);

    // Create notification for the organization owner
    await prisma.notification.create({
      data: {
        userId: org.userId,
        title: "NGO Verification Tier Update",
        message: `Your NGO profile status was updated to ${status} and tier set to ${verificationTier}.`,
        type: "SCORE",
        link: `/dashboard/charity/trust-score`,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        performedBy: session.user.email || "admin",
        action: "VERIFY_ORGANIZATION",
        targetType: "ORGANIZATION",
        targetId: organizationId,
        details: JSON.stringify({ status, verificationTier }),
      },
    });

    return NextResponse.json({ success: true, org });
  } catch (error: any) {
    console.error("Error verifying organization:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
