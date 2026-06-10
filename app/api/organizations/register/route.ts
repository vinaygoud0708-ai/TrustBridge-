import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CHARITY") {
      return NextResponse.json({ error: "Only accounts registered under the Charity role can create organizations." }, { status: 403 });
    }

    // Check if organization already exists for this user
    const existingOrg = await prisma.organization.findUnique({
      where: { userId: session.user.id },
    });

    if (existingOrg) {
      return NextResponse.json({ error: "This user account is already linked to an NGO profile." }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      description,
      registrationNumber,
      taxId,
      bankAccountName,
      bankAccountNumber,
      bankIFSC,
      address,
      city,
      country,
      website,
      logo,
      documents // Array of { type: string, fileUrl: string, fileName: string }
    } = body;

    // Validation
    if (!name || !description || !registrationNumber || !taxId || !bankAccountName || !bankAccountNumber || !bankIFSC || !address || !city || !country) {
      return NextResponse.json({ error: "All required registration details must be provided." }, { status: 400 });
    }

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json({ error: "Please upload at least one legal verification document." }, { status: 400 });
    }

    // Execute in transaction
    const organization = await prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          userId: session.user.id,
          name,
          description,
          registrationNumber,
          taxId,
          bankAccountName,
          bankAccountNumber,
          bankIFSC,
          address,
          city,
          country,
          website: website || null,
          logo: logo || null,
          status: "PENDING", // Initial status
          verificationTier: "BRONZE", // Default tier
          trustScore: 3.0, // Baseline trust score
        },
      });

      // 2. Create Documents
      for (const doc of documents) {
        await tx.document.create({
          data: {
            organizationId: org.id,
            type: doc.type,
            fileUrl: doc.fileUrl,
            fileName: doc.fileName,
            status: "PENDING",
          },
        });
      }

      // 3. Create trust score record (baseline)
      await tx.trustScore.create({
        data: {
          organizationId: org.id,
          verificationScore: 10.0, // BRONZE baseline
          reportingScore: 25.0,    // max default
          donorRatingScore: 20.0,  // max default
          completionScore: 15.0,   // max default
          complaintScore: 10.0,    // max default
          totalScore: 80.0,
        },
      });

      // 4. Create Notification for admin review
      const admins = await tx.user.findMany({ where: { role: "ADMIN" } });
      for (const admin of admins) {
        await tx.notification.create({
          data: {
            userId: admin.id,
            title: "New NGO Review Queue",
            message: `NGO "${name}" has submitted registration documents for approval.`,
            type: "COMPLAINT", // Vetting type
            link: `/dashboard/admin/verifications`,
          },
        });
      }

      // 5. Create Audit Log
      await tx.auditLog.create({
        data: {
          performedBy: session.user.email || session.user.id,
          action: "SUBMIT_NGO_REGISTRATION",
          targetType: "ORGANIZATION",
          targetId: org.id,
          details: JSON.stringify({ name, registrationNumber, documentCount: documents.length }),
        },
      });

      return org;
    });

    console.log(`[CHARITY_PARTNERS] Created new NGO profile: ID = ${organization.id}, Name = ${organization.name}`);

    return NextResponse.json({
      success: true,
      message: "Organization registered successfully for review.",
      organizationId: organization.id
    });

  } catch (error) {
    console.error("POST_ORGANIZATION_REGISTER_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
