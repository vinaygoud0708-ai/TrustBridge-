import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { recalculateTrustScore } from "@/lib/trust-score";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const body = await req.json();
    const { campaignId, organizationId, filedBy, type, description, evidence } = body;

    if (!organizationId || !type || !description) {
      return NextResponse.json({ error: "Missing required dispute parameters" }, { status: 400 });
    }

    // Determine filer identification
    let filerName = filedBy || "Anonymous Filer";
    if (session?.user) {
      filerName = `${session.user.name} (${session.user.email})`;
    }

    // Validate organization exists
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      return NextResponse.json({ error: "NGO organization not found" }, { status: 404 });
    }

    // Create the complaint record
    const complaint = await prisma.complaint.create({
      data: {
        organizationId,
        campaignId: campaignId || null,
        filedBy: filerName,
        type,
        description,
        evidence: JSON.stringify(evidence || []),
        status: "OPEN",
      },
    });

    // Increment complaint count on organization
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        complaintsCount: {
          increment: 1,
        },
      },
    });

    // Trigger trust score engine recalculation immediately
    await recalculateTrustScore(organizationId);

    // Notify administrators
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "New Dispute Complaint Filed",
          message: `${type} complaint filed against ${org.name}.`,
          type: "COMPLAINT",
          link: `/dashboard/admin/complaints`,
        },
      });
    }

    return NextResponse.json({ success: true, complaint });
  } catch (error: any) {
    console.error("Error filing complaint:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
