import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { recalculateTrustScore } from "@/lib/trust-score";
import { sendReceiptEmail } from "@/lib/email";

export async function POST(request: Request) {
  let event: any;
  let isMock = false;

  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Check if it's a simulated sandbox transaction
    if (body.isMock) {
      event = body;
      isMock = true;
    } else {
      // Real Stripe Webhook verification
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_mock_key";
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock_key";
      const signature = request.headers.get("stripe-signature");

      if (!signature) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
      }

      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2022-11-15" as any,
      });

      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    }

    // Handle checkout session completed
    if (event.type === "checkout.session.completed") {
      const sessionObject = isMock ? event.data.object : event.data.object;

      const metadata = sessionObject.metadata;
      const amountCents = sessionObject.amount_total;
      const amount = amountCents / 100; // convert cents to dollars
      const currency = sessionObject.currency.toUpperCase();
      const stripePaymentId = isMock ? sessionObject.id_stripe : sessionObject.payment_intent as string;
      const campaignId = metadata.campaignId;
      const isAnonymous = metadata.isAnonymous === "true";
      const message = metadata.message || null;
      const donorName = metadata.donorName;
      const donorEmail = metadata.donorEmail;
      const donorId = metadata.donorId || null;

      // Verify the campaign exists
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { organization: true },
      });

      if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      }

      // Check for duplicate transaction
      const existingDonation = await prisma.donation.findUnique({
        where: { stripePaymentId },
      });

      if (existingDonation) {
        return NextResponse.json({ success: true, message: "Duplicate transaction skipped" });
      }

      // Create Donation Record inside a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create donation
        const donation = await tx.donation.create({
          data: {
            campaignId,
            donorId: donorId || null,
            amount,
            currency,
            stripePaymentId,
            status: "SUCCESS",
            isAnonymous,
            donorName: isAnonymous ? null : donorName,
            donorEmail: isAnonymous ? null : donorEmail,
            message,
            taxReceiptGenerated: true,
            receiptUrl: `/api/donations/${stripePaymentId}/receipt`,
          },
        });

        // Update Campaign stats
        await tx.campaign.update({
          where: { id: campaignId },
          data: {
            raisedAmount: { increment: amount },
            totalDonors: { increment: 1 },
          },
        });

        // Update Organization total raised stats
        await tx.organization.update({
          where: { id: campaign.organizationId },
          data: {
            totalRaised: { increment: amount },
          },
        });

        // Create transaction logs
        // 1. Donation Transaction
        await tx.transaction.create({
          data: {
            donationId: donation.id,
            type: "DONATION",
            amount,
            currency,
            status: "SUCCESS",
            reference: `TXN_DON_${donation.id.substring(0, 8).toUpperCase()}`,
            metadata: JSON.stringify({ campaignTitle: campaign.title, donorEmail }),
          },
        });

        // 2. Commission Transaction (10% platform fee)
        const commissionAmount = amount * 0.10;
        await tx.transaction.create({
          data: {
            donationId: donation.id,
            type: "COMMISSION",
            amount: commissionAmount,
            currency,
            status: "SUCCESS",
            reference: `TXN_COM_${donation.id.substring(0, 8).toUpperCase()}`,
            metadata: JSON.stringify({ rate: 0.10 }),
          },
        });

        // Create Notifications
        // Notification for host NGO
        await tx.notification.create({
          data: {
            userId: campaign.organization.userId,
            title: "New Campaign Donation",
            message: `A donation of $${amount} was received for "${campaign.title}" from ${isAnonymous ? "an Anonymous Supporter" : donorName}.`,
            type: "DONATION",
            link: `/dashboard/charity`,
          },
        });

        // Notification for donor (if registered)
        if (donorId) {
          await tx.notification.create({
            data: {
              userId: donorId,
              title: "Donation Confirmed!",
              message: `Thank you for donating $${amount} to "${campaign.title}". You can download your receipt now.`,
              type: "DONATION",
              link: `/dashboard/donor/donations`,
            },
          });
        }

        // Notification for admin
        const admins = await tx.user.findMany({ where: { role: "ADMIN" } });
        for (const admin of admins) {
          await tx.notification.create({
            data: {
              userId: admin.id,
              title: "New Platform Donation",
              message: `$${amount} donated to campaign "${campaign.title}". Commission: $${commissionAmount.toFixed(2)}.`,
              type: "DONATION",
              link: `/dashboard/admin`,
            },
          });
        }

        return donation;
      });

      // Send Email Receipt to donor
      if (donorEmail) {
        try {
          const reqUrl = new URL(request.url);
          const receiptAbsoluteUrl = `${reqUrl.protocol}//${reqUrl.host}/api/donations/${stripePaymentId}/receipt`;
          await sendReceiptEmail(
            donorEmail,
            donorName || "Supporter",
            campaign.title,
            amount,
            receiptAbsoluteUrl
          );
        } catch (emailErr) {
          console.error("[WEBHOOK] Failed to dispatch receipt email:", emailErr);
        }
      }

      // Trigger Trust Score Engine recalculation asynchronously
      await recalculateTrustScore(campaign.organizationId);

      console.log(`[PAYMENT WEBHOOK] Successfully processed donation of $${amount} to campaign '${campaign.title}'`);
      return NextResponse.json({ success: true, donationId: result.id });
    }

    return NextResponse.json({ success: true, message: "Event ignored" });
  } catch (error: any) {
    console.error("WEBHOOK_API_ERROR", error);
    return NextResponse.json({ error: error.message || "Webhook handler error" }, { status: 400 });
  }
}
