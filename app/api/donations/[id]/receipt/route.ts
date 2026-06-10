import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateReceiptPdf } from "@/lib/pdf-generator";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Search by ID or stripePaymentId for maximum lookups compatibility
    const donation = await prisma.donation.findFirst({
      where: {
        OR: [
          { id },
          { stripePaymentId: id }
        ]
      },
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
      return NextResponse.json({ error: "Donation record not found" }, { status: 404 });
    }

    // Resolve donor identity
    const donorName = donation.isAnonymous 
      ? "Anonymous Friend" 
      : (donation.donor?.name || donation.donorName || "Supporter");
      
    const donorEmail = donation.isAnonymous 
      ? "anonymous@trustbridge.com" 
      : (donation.donor?.email || donation.donorEmail || "guest@trustbridge.com");

    const pdfBuffer = await generateReceiptPdf({
      id: donation.id,
      donorName,
      donorEmail,
      amount: donation.amount,
      currency: donation.currency,
      campaignTitle: donation.campaign.title,
      ngoName: donation.campaign.organization.name,
      taxId: donation.campaign.organization.taxId,
      transactionId: donation.stripePaymentId,
      createdAt: donation.createdAt,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="TrustBridge_Receipt_${donation.id.substring(0, 8)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("GENERATE_RECEIPT_PDF_API_ERROR", error);
    return NextResponse.json({ error: "Failed to generate receipt PDF" }, { status: 500 });
  }
}
