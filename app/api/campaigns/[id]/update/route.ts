import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CHARITY") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Check if the campaign belongs to this charity's organization
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.organizationId !== session.user.orgId) {
      return NextResponse.json({ error: "Campaign not found or access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, imageUrl } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const update = await prisma.campaignUpdate.create({
      data: {
        campaignId,
        title,
        content,
        imageUrl: imageUrl || null,
      },
    });

    // Notify all donors who contributed to this campaign
    const donations = await prisma.donation.findMany({
      where: { campaignId, status: "SUCCESS" },
      select: { donorId: true },
      distinct: ["donorId"],
    });

    for (const donation of donations) {
      if (donation.donorId) {
        await prisma.notification.create({
          data: {
            userId: donation.donorId,
            title: `Campaign Update: ${campaign.title}`,
            message: `"${title}" has been published by the organizer.`,
            type: "UPDATE",
            link: `/campaigns/${campaignId}`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, update });
  } catch (error: any) {
    console.error("Error creating campaign update:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
