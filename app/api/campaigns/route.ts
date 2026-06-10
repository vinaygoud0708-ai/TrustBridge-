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

    const body = await req.json();
    const {
      title,
      description,
      story,
      goalAmount,
      category,
      startDate,
      endDate,
      location,
      coverImage,
      usagePlan,
    } = body;

    // Validation
    if (!title || !description || !story || !goalAmount || !category || !startDate || !endDate || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parsedGoal = parseFloat(goalAmount);
    if (isNaN(parsedGoal) || parsedGoal <= 0) {
      return NextResponse.json({ error: "Invalid goal amount" }, { status: 400 });
    }

    // Check organization status
    const org = await prisma.organization.findUnique({
      where: { id: session.user.orgId },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Create the campaign
    // Default status is PENDING if org is approved, otherwise DRAFT
    const campaignStatus = org.status === "APPROVED" ? "PENDING" : "DRAFT";

    const campaign = await prisma.campaign.create({
      data: {
        organizationId: org.id,
        title,
        description,
        story,
        goalAmount: parsedGoal,
        category,
        status: campaignStatus,
        coverImage: coverImage || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        usagePlan: JSON.stringify(usagePlan || []),
      },
    });

    // Update organization campaigns count
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        totalCampaigns: {
          increment: 1,
        },
      },
    });

    // Notify administrators if pending approval
    if (campaignStatus === "PENDING") {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: "New Campaign Awaiting Approval",
            message: `Campaign "${title}" by ${org.name} requires verification.`,
            type: "UPDATE",
            link: `/dashboard/admin/campaigns`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
