import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { campaignId, amount, isAnonymous, message, donorName, donorEmail } = body;

    if (!campaignId || !amount) {
      return NextResponse.json({ error: "Campaign ID and amount are required" }, { status: 400 });
    }

    // Resolve user details
    const email = session?.user ? session.user.email : donorEmail;
    const name = session?.user ? session.user.name : donorName;

    // Verify campaign is active
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { organization: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status !== "ACTIVE") {
      return NextResponse.json({ error: "Campaign is not currently active" }, { status: 400 });
    }

    // Check if Stripe key is mock key
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_mock_key";

    if (stripeSecretKey === "sk_test_mock_key") {
      // Mock mode redirect URL
      const mockUrl = `/campaigns/${campaignId}/donate-mock?` + 
        `amount=${amount}` +
        `&isAnonymous=${isAnonymous ? "true" : "false"}` +
        `&message=${encodeURIComponent(message || "")}` +
        `&donorName=${encodeURIComponent(name || "Anonymous Friend")}` +
        `&donorEmail=${encodeURIComponent(email || "guest@trustbridge.com")}`;

      return NextResponse.json({ url: mockUrl });
    }

    // Real Stripe Integration
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15" as any, // Cast to any to avoid version mismatch alerts
    });

    const successUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/campaigns/${campaignId}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/campaigns/${campaignId}`;

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Donation: ${campaign.title}`,
              description: `Supporting host organization ${campaign.organization.name}`,
              images: [campaign.coverImage],
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        campaignId,
        isAnonymous: isAnonymous ? "true" : "false",
        message: message || "",
        donorName: name || "Anonymous Friend",
        donorEmail: email || "guest@trustbridge.com",
        donorId: session?.user ? session.user.id : "",
      },
      customer_email: email || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("CREATE_CHECKOUT_ERROR", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
