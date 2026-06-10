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
    const { complaintId, status, adminNote } = body;

    if (!complaintId || !status) {
      return NextResponse.json({ error: "Complaint ID and target status are required" }, { status: 400 });
    }

    // Fetch the complaint record
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    const oldStatus = complaint.status;
    const newStatus = status;

    const updateData: any = { status };
    if (adminNote) updateData.adminNote = adminNote;
    if (newStatus === "RESOLVED" || newStatus === "DISMISSED") {
      updateData.resolvedAt = new Date();
    }

    // Update complaint record
    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: updateData,
    });

    // Determine if complaintsCount shifts on Organization
    // If transitioning from OPEN/INVESTIGATING to RESOLVED/DISMISSED: complaintsCount decrements
    // If transitioning from RESOLVED/DISMISSED to OPEN/INVESTIGATING: complaintsCount increments
    const wasActive = oldStatus === "OPEN" || oldStatus === "INVESTIGATING";
    const isActiveNow = newStatus === "OPEN" || newStatus === "INVESTIGATING";

    if (wasActive && !isActiveNow) {
      await prisma.organization.update({
        where: { id: complaint.organizationId },
        data: {
          complaintsCount: {
            decrement: 1,
          },
        },
      });
    } else if (!wasActive && isActiveNow) {
      await prisma.organization.update({
        where: { id: complaint.organizationId },
        data: {
          complaintsCount: {
            increment: 1,
          },
        },
      });
    }

    // Recalculate organization trust score (complaints deduction will shift)
    await recalculateTrustScore(complaint.organizationId);

    // Notify organization owner
    const org = await prisma.organization.findUnique({
      where: { id: complaint.organizationId },
    });

    if (org) {
      await prisma.notification.create({
        data: {
          userId: org.userId,
          title: `Dispute Case Update: ${newStatus}`,
          message: `Administrative dispute case (Ref: ${complaintId.substring(0, 8)}) was updated to ${newStatus}. Note: ${adminNote || "None"}.`,
          type: "COMPLAINT",
          link: `/dashboard/charity`,
        },
      });
    }

    // Log the audit
    await prisma.auditLog.create({
      data: {
        performedBy: session.user.email || "admin",
        action: `RESOLVE_COMPLAINT_${newStatus}`,
        targetType: "COMPLAINT",
        targetId: complaintId,
        details: JSON.stringify({ status: newStatus, adminNote }),
      },
    });

    return NextResponse.json({ success: true, complaint: updatedComplaint });
  } catch (error: any) {
    console.error("Error managing dispute case:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
