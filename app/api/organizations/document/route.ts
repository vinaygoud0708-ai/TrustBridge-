import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "CHARITY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.orgId) {
      return NextResponse.json({ error: "No organization associated" }, { status: 400 });
    }

    const orgId = session.user.orgId;
    const body = await req.json();
    const { type, fileName, fileUrl } = body;

    if (!type || !fileName) {
      return NextResponse.json({ error: "Document type and filename are required" }, { status: 400 });
    }

    // Create the document record
    const document = await prisma.document.create({
      data: {
        organizationId: orgId,
        type,
        fileName,
        fileUrl: fileUrl || "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=800&q=80",
        status: "PENDING",
      },
    });

    // Notify administrators
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    });

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "New Legal Document Uploaded",
          message: `${org?.name} uploaded a ${type} document for review.`,
          type: "PROOF",
          link: `/dashboard/admin/verifications`,
        },
      });
    }

    return NextResponse.json({ success: true, document });
  } catch (error: any) {
    console.error("Error saving document:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
