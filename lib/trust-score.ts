import prisma from "@/lib/prisma";

export async function recalculateTrustScore(organizationId: string) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        campaigns: {
          select: { id: true, status: true },
        },
        reviews: {
          select: { rating: true },
        },
        withdrawals: {
          select: { id: true, proofUploaded: true, status: true },
        },
      },
    });

    if (!org) return;

    // 1. Verification Tier Score (Max 30)
    let verificationScore = 10.0; // Bronze
    if (org.verificationTier === "GOLD") {
      verificationScore = 30.0;
    } else if (org.verificationTier === "SILVER") {
      verificationScore = 20.0;
    }

    // 2. Reporting Score (Max 25)
    // Formula: (onTimeReports / totalWithdrawals) * 25
    // For safety, onTimeReports are DISBURSED withdrawals where proof has been uploaded.
    const completedWithdrawals = org.withdrawals.filter(w => w.status === "DISBURSED");
    const totalWithdrawals = completedWithdrawals.length;
    const onTimeReports = completedWithdrawals.filter(w => w.proofUploaded).length;

    let reportingScore = 25.0; // Default to max score if no withdrawals exist yet
    if (totalWithdrawals > 0) {
      reportingScore = (onTimeReports / totalWithdrawals) * 25.0;
    }

    // 3. Donor Rating Score (Max 20)
    // Formula: (averageRating / 5) * 20
    const reviewCount = org.reviews.length;
    const averageRating = reviewCount > 0 
      ? org.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
      : 4.0; // Baseline default rating of 4.0 if no reviews exist

    const donorRatingScore = (averageRating / 5.0) * 20.0;

    // 4. Completion Score (Max 15)
    // Formula: (completedCampaigns / totalCampaigns) * 15
    const totalCampaigns = org.campaigns.length;
    const completedCampaigns = org.campaigns.filter(c => c.status === "COMPLETED").length;
    
    let completionScore = 15.0; // Default to max if no campaigns launched yet
    if (totalCampaigns > 0) {
      completionScore = (completedCampaigns / totalCampaigns) * 15.0;
    }

    // 5. Complaint Score (Max 10)
    // Formula: max(0, 10 - (complaintsCount * 2))
    const complaintScore = Math.max(0, 10.0 - (org.complaintsCount * 2.0));

    // Calculate sum (max 100)
    const totalScoreIndex = verificationScore + reportingScore + donorRatingScore + completionScore + complaintScore;
    
    // Scale to out of 5 stars (e.g. 95 / 20 = 4.75 stars)
    const starsRating = totalScoreIndex / 20.0;

    // Save trust score in DB
    await prisma.trustScore.upsert({
      where: { organizationId: org.id },
      update: {
        verificationScore,
        reportingScore,
        donorRatingScore,
        completionScore,
        complaintScore,
        totalScore: totalScoreIndex,
        lastCalculated: new Date(),
      },
      create: {
        organizationId: org.id,
        verificationScore,
        reportingScore,
        donorRatingScore,
        completionScore,
        complaintScore,
        totalScore: totalScoreIndex,
      },
    });

    // Update main Organization trust score
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        trustScore: starsRating,
        totalCampaigns,
        completedCampaigns,
      },
    });

    console.log(`[TRUST ENGINE] Recalculated score for NGO '${org.name}': Stars = ${starsRating.toFixed(2)}, Score = ${totalScoreIndex}`);
  } catch (error) {
    console.error("TRUST_ENGINE_RECALCULATION_ERROR", error);
  }
}
