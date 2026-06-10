import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
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

    const {
      description,
      website,
      logo,
      address,
      city,
      country,
      bankAccountName,
      bankAccountNumber,
      bankIFSC,
    } = body;

    // Validate
    if (!description || !address || !city || !country || !bankAccountName || !bankAccountNumber || !bankIFSC) {
      return NextResponse.json({ error: "Missing required profile details" }, { status: 400 });
    }

    // Update organization profile
    const org = await prisma.organization.update({
      where: { id: orgId },
      data: {
        description,
        website: website || null,
        logo: logo || null,
        address,
        city,
        country,
        bankAccountName,
        bankAccountNumber,
        bankIFSC,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        performedBy: session.user.email || "unknown",
        action: "UPDATE_PROFILE",
        targetType: "ORGANIZATION",
        targetId: orgId,
        details: JSON.stringify({ description, website, address, city, country }),
      },
    });

    return NextResponse.json({ success: true, org });
  } catch (error: any) {
    console.error("Error updating organization profile:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
