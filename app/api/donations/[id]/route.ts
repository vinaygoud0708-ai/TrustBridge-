import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        campaign: {
          include: {
            organization: true,
          },
        },
        donor: true,
      },
    });

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Role-based visibility validation
    const isAdmin = session.user.role === "ADMIN";
    const isDonor = donation.donorId === session.user.id;
    const isCharityOwner = donation.campaign.organization.userId === session.user.id;

    if (!isAdmin && !isDonor && !isCharityOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(donation);
  } catch (error) {
    console.error("GET_DONATION_DETAIL_API_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
