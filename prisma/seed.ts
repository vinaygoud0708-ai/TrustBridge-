import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Clean existing database records
  await prisma.transaction.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.trustScore.deleteMany({});
  await prisma.fundUsage.deleteMany({});
  await prisma.withdrawalRequest.deleteMany({});
  await prisma.donation.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Cleared database.");

  // Password hashes
  const adminPasswordHash = bcryptjs.hashSync("Admin@123", 12);
  const userPasswordHash = bcryptjs.hashSync("Password@123", 12);

  // 1. Create ADMIN user
  const admin = await prisma.user.create({
    data: {
      name: "TrustBridge Administrator",
      email: "admin@trustbridge.com",
      password: adminPasswordHash,
      role: "ADMIN",
      isVerified: true,
    },
  });
  console.log("Created Admin: ", admin.email);

  // 2. Create Charity Owners & Organizations
  // NGO 1: Gold - Hope Education Foundation
  const userNgo1 = await prisma.user.create({
    data: {
      name: "Sarah Jenkins",
      email: "sarah@hope-edu.org",
      phone: "+1555019201",
      password: userPasswordHash,
      role: "CHARITY",
      isVerified: true,
    },
  });

  const orgNgo1 = await prisma.organization.create({
    data: {
      userId: userNgo1.id,
      name: "Hope Education Foundation",
      description: "Dedicated to providing high-quality primary education and school infrastructure to children in marginalized rural communities globally.",
      registrationNumber: "NGO-EDU-2021-9988",
      taxId: "TAX-EXEMPT-EDU-501C3",
      bankAccountName: "Hope Education Foundation Inc",
      bankAccountNumber: "10984758392",
      bankIFSC: "CHASE000129",
      address: "450 Broadway St, Suite 10",
      city: "New York",
      country: "United States",
      website: "https://hope-edu.org",
      logo: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80",
      status: "APPROVED",
      verificationTier: "GOLD",
      trustScore: 4.8,
      totalRaised: 36000.0,
      totalCampaigns: 2,
      completedCampaigns: 0,
    },
  });

  await prisma.trustScore.create({
    data: {
      organizationId: orgNgo1.id,
      verificationScore: 30.0, // GOLD
      reportingScore: 25.0,    // 100% on time
      donorRatingScore: 18.0,  // ~4.5 rating
      completionScore: 12.0,   // progress
      complaintScore: 10.0,    // 0 complaints
      totalScore: 95.0,        // Total out of 100
    },
  });

  await prisma.document.createMany({
    data: [
      {
        organizationId: orgNgo1.id,
        type: "REGISTRATION",
        fileName: "Registration_Certificate.pdf",
        fileUrl: "https://res.cloudinary.com/demo/image/upload/v1570975200/sample.pdf",
        status: "APPROVED",
      },
      {
        organizationId: orgNgo1.id,
        type: "TAX",
        fileName: "501c3_Tax_Exemption.pdf",
        fileUrl: "https://res.cloudinary.com/demo/image/upload/v1570975200/sample.pdf",
        status: "APPROVED",
      },
      {
        organizationId: orgNgo1.id,
        type: "BANK",
        fileName: "Bank_Statement_May2026.pdf",
        fileUrl: "https://res.cloudinary.com/demo/image/upload/v1570975200/sample.pdf",
        status: "APPROVED",
      },
    ],
  });

  // NGO 2: Silver - Clean Water Initiative
  const userNgo2 = await prisma.user.create({
    data: {
      name: "Marcus Aurelius",
      email: "marcus@cleanwater.org",
      phone: "+447911123456",
      password: userPasswordHash,
      role: "CHARITY",
      isVerified: true,
    },
  });

  const orgNgo2 = await prisma.organization.create({
    data: {
      userId: userNgo2.id,
      name: "Clean Water Initiative",
      description: "Building sustainable water wells and filtration platforms to bring safe drinking water to remote villages suffering from waterborne illnesses.",
      registrationNumber: "NGO-WAT-2023-4411",
      taxId: "TAX-EXEMPT-WAT-4903",
      bankAccountName: "Clean Water Initiative Fund",
      bankAccountNumber: "98765432101",
      bankIFSC: "BARC002849",
      address: "12 Regent St",
      city: "London",
      country: "United Kingdom",
      website: "https://clean-water.org",
      logo: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=120&auto=format&fit=crop&q=80",
      status: "APPROVED",
      verificationTier: "SILVER",
      trustScore: 4.2,
      totalRaised: 11250.0,
      totalCampaigns: 2,
      completedCampaigns: 0,
    },
  });

  await prisma.trustScore.create({
    data: {
      organizationId: orgNgo2.id,
      verificationScore: 20.0, // SILVER
      reportingScore: 20.0,    // Good reports
      donorRatingScore: 16.0,  // ~4.0 rating
      completionScore: 10.0,
      complaintScore: 10.0,
      totalScore: 76.0,        // Total
    },
  });

  // NGO 3: Bronze - Community Health Trust
  const userNgo3 = await prisma.user.create({
    data: {
      name: "Rajesh Kumar",
      email: "rajesh@healthtrust.org",
      phone: "+919876543210",
      password: userPasswordHash,
      role: "CHARITY",
      isVerified: true,
    },
  });

  const orgNgo3 = await prisma.organization.create({
    data: {
      userId: userNgo3.id,
      name: "Community Health Trust",
      description: "Organizing free medical checkups, essential surgeries, and medication distribution for under-resourced families in rural provinces.",
      registrationNumber: "NGO-HEA-2020-0012",
      taxId: "TAX-EXEMPT-HEA-80G",
      bankAccountName: "Community Health Trust Account",
      bankAccountNumber: "5020002938491",
      bankIFSC: "HDFC0000124",
      address: "Sector 4, Plot 12",
      city: "New Delhi",
      country: "India",
      website: "https://healthtrust.org",
      logo: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=120&auto=format&fit=crop&q=80",
      status: "APPROVED",
      verificationTier: "BRONZE",
      trustScore: 3.7,
      totalRaised: 15000.0,
      totalCampaigns: 1,
      completedCampaigns: 1,
    },
  });

  await prisma.trustScore.create({
    data: {
      organizationId: orgNgo3.id,
      verificationScore: 10.0, // BRONZE
      reportingScore: 25.0,    // Excellent reporting
      donorRatingScore: 14.0,  // Average rating ~3.5
      completionScore: 15.0,   // 100% completed campaign
      complaintScore: 10.0,    // No complaints
      totalScore: 74.0,
    },
  });

  console.log("Created Organizations and TrustScores.");

  // 3. Create Sample Campaigns
  // Campaign 1: Hope Education Foundation - Build 10 Schools in Rural Areas
  const campaign1 = await prisma.campaign.create({
    data: {
      organizationId: orgNgo1.id,
      title: "Build 10 Schools in Rural Areas",
      description: "Help us build safe, brick-and-mortar primary schools equipped with desks, blackboards, solar lighting, and toilets for children currently learning under trees.",
      story: "<p>In rural sub-Saharan villages, over 65% of children have no physical classroom to study in. When it rains, school is cancelled. When it is too hot, they cannot focus. This campaign aims to construct 10 durable, high-utility schools complete with clean water collection systems, toilets, and teachers' quarters.</p><p>We have partnered with local engineers and community leaders to build these structures with local labor, creating jobs while fostering a community sense of ownership.</p>",
      goalAmount: 50000.0,
      raisedAmount: 36000.0,
      category: "EDUCATION",
      status: "ACTIVE",
      coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&auto=format&fit=crop&q=80"
      ]),
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-08-30"),
      location: "Malawi",
      latitude: -13.2543,
      longitude: 34.3015,
      beneficiaryCount: 1500,
      totalDonors: 6,
      isUrgent: false,
      isFeatured: true,
      usagePlan: JSON.stringify([
        { item: "Foundation and Bricks for 10 classrooms", amount: 20000.0, description: "Procurement of bricks, cement, gravel, and foundation works." },
        { item: "Roofing and Metal frames", amount: 15000.0, description: "Iron sheet roofing and reinforced steel structural supports." },
        { item: "Desks and Classroom Furniture", amount: 10000.0, description: "Wooden desks, benches, teachers' chairs, and whiteboards." },
        { item: "Water tanks and plumbing", amount: 5000.0, description: "Rainwater harvesting gutters and storage tanks." }
      ]),
    },
  });

  // Campaign 2: Hope Education Foundation - Scholarships for 50 Girls
  const campaign2 = await prisma.campaign.create({
    data: {
      organizationId: orgNgo1.id,
      title: "Scholarships for 50 Girls",
      description: "Sponsor tuition fees, school uniforms, and textbooks for 50 bright, underprivileged girls to continue their high school education.",
      story: "<p>For families living under the poverty line, high school tuition is an impossible expense. Sadly, girls are often the first to be pulled out of school. This scholarship fund covers full academic expenses, ensuring girls can complete their education and break the cycle of poverty.</p>",
      goalAmount: 30000.0,
      raisedAmount: 0.0,
      category: "EDUCATION",
      status: "ACTIVE",
      coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-12-31"),
      location: "Kenya",
      latitude: -1.2921,
      longitude: 36.8219,
      beneficiaryCount: 50,
      totalDonors: 0,
      isUrgent: false,
      isFeatured: false,
      usagePlan: JSON.stringify([
        { item: "Tuition and School Fees", amount: 18000.0, description: "Direct school tuition payments for 50 girls for 1 academic year." },
        { item: "Textbooks and Stationery", amount: 6000.0, description: "Subject textbooks, note folders, and writing materials." },
        { item: "School Uniforms and Shoes", amount: 6000.0, description: "Official uniforms and durable school footwear." }
      ]),
    },
  });

  // Campaign 3: Clean Water Initiative - Clean Drinking Water for 500 Families
  const campaign3 = await prisma.campaign.create({
    data: {
      organizationId: orgNgo2.id,
      title: "Clean Drinking Water for 500 Families",
      description: "Install 5 community boreholes and reverse osmosis filtration systems in rural drylands to provide safe, clean water close to homes.",
      story: "<p>Women and children in these dryland sectors walk upwards of 6 kilometers daily to collect muddy, contaminated water from dry riverbeds. By drilling shallow boreholes and equipping them with solar-powered pumps, we will deliver drinkable, pathogen-free water directly to 5 village centers.</p>",
      goalAmount: 25000.0,
      raisedAmount: 11250.0,
      category: "ENVIRONMENT",
      status: "ACTIVE",
      coverImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=400&auto=format&fit=crop&q=80"
      ]),
      startDate: new Date("2026-05-15"),
      endDate: new Date("2026-09-15"),
      location: "Tanzania",
      latitude: -6.3690,
      longitude: 34.8888,
      beneficiaryCount: 2500,
      totalDonors: 4,
      isUrgent: false,
      isFeatured: true,
      usagePlan: JSON.stringify([
        { item: "Borehole Drilling and Excavation", amount: 15000.0, description: "Hydrological surveys and heavy drilling machinery deployment." },
        { item: "Solar Pump System", amount: 6000.0, description: "Solar panel grids, submersible pumps, and control systems." },
        { item: "Distribution Pipes and Taps", amount: 4000.0, description: "Building concrete draw taps and surrounding gravel filtration pits." }
      ]),
    },
  });

  // Campaign 4: Clean Water Initiative - Disaster Relief Fund - Flood Victims
  const campaign4 = await prisma.campaign.create({
    data: {
      organizationId: orgNgo2.id,
      title: "Disaster Relief Fund - Flood Victims",
      description: "Deliver emergency clean water kits, food rations, and medical supplies to families displaced by sudden torrential floods.",
      story: "<p>Recent flash floods have washed away roads, homes, and water supply grids, stranding thousands in temporary tents with no access to basic sanitary resources. Immediate response is required to prevent outbreaks of cholera and dysentery.</p>",
      goalAmount: 100000.0,
      raisedAmount: 23000.0,
      category: "DISASTER",
      status: "ACTIVE",
      coverImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80",
      startDate: new Date("2026-06-05"),
      endDate: new Date("2026-07-05"),
      location: "Bangladesh",
      latitude: 23.6850,
      longitude: 90.3563,
      beneficiaryCount: 10000,
      totalDonors: 0,
      isUrgent: true,
      isFeatured: false,
      usagePlan: JSON.stringify([
        { item: "Water purification tablets and filters", amount: 40000.0, description: "Distribution of life-straws and chlorine purification tablets." },
        { item: "Dry food packages and milk powder", amount: 40000.0, description: "Rice, pulses, edible oils, and high-energy biscuits." },
        { item: "Emergency hygiene kits and tents", amount: 20000.0, description: "Soaps, sanitary pads, blankets, and plastic ground sheets." }
      ]),
    },
  });

  // Campaign 5: Community Health Trust - Free Medical Camp for 1000 People
  const campaign5 = await prisma.campaign.create({
    data: {
      organizationId: orgNgo3.id,
      title: "Free Medical Camp for 1000 People",
      description: "Provide free primary medical checkups, cardiac screenings, free medicines, and eye surgeries to 1,000 poor rural residents.",
      story: "<p>With no local clinic for 40 miles, minor infections and manageable conditions frequently turn into life-threatening crises in this village block. This medical camp brings professional medical doctors, pediatricians, opticians, and free medicine supplies to the community center for a 3-day intense clinic.</p>",
      goalAmount: 15000.0,
      raisedAmount: 15000.0, // Fully funded
      category: "HEALTH",
      status: "COMPLETED",
      coverImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-04-20"),
      location: "India",
      latitude: 28.6139,
      longitude: 77.2090,
      beneficiaryCount: 1200,
      totalDonors: 2,
      isUrgent: false,
      isFeatured: false,
      usagePlan: JSON.stringify([
        { item: "Medicines and Pharmaceutical Supplies", amount: 6000.0, description: "Antibiotics, heart medications, vitamins, and eye drops." },
        { item: "Doctors and Nurses Stipends", amount: 5000.0, description: "Stipends and transport for 15 medical staff members for 3 days." },
        { item: "Cataract Surgical Equipment lease", amount: 4000.0, description: "Surgical consumables and portable testing systems." }
      ]),
    },
  });

  console.log("Created 5 Campaigns.");

  // 4. Create Donors (10 Users with Donor roles)
  const donors = [];
  const names = [
    "Alice Vance", "Bob Miller", "Charlie Smith", "Diana Prince", "Ethan Hunt",
    "Fiona Gallagher", "George Clark", "Hannah Abbott", "Ian Wright", "Julia Roberts"
  ];

  for (let i = 0; i < 10; i++) {
    const donor = await prisma.user.create({
      data: {
        name: names[i],
        email: `donor${i + 1}@trustbridge.com`,
        phone: `+155500010${i}`,
        password: userPasswordHash,
        role: "DONOR",
        isVerified: true,
      },
    });
    donors.push(donor);
  }
  console.log("Created 10 Donors.");

  // 5. Create Donation records
  // Donations for Campaign 1 (Hope Education)
  const donationsCampaign1 = [
    { donor: donors[0], amount: 10000.0, reference: "txn_tb_c1_1", message: "Education is the key to a better future!" },
    { donor: donors[1], amount: 5000.0, reference: "txn_tb_c1_2", message: "Excited to see these classrooms built." },
    { donor: donors[2], amount: 15000.0, reference: "txn_tb_c1_3", message: "In honor of my mother, who was a teacher." },
    { donor: donors[3], amount: 2000.0, reference: "txn_tb_c1_4", message: "Keep up the amazing work!" },
    { donor: donors[4], amount: 3000.0, reference: "txn_tb_c1_5", message: "Greetings from California!" },
    { donor: null, amount: 1000.0, reference: "txn_tb_c1_guest", message: "Guest donation to support the children.", name: "Anonymous Friend", email: "guest1@gmail.com" },
  ];

  for (const d of donationsCampaign1) {
    const donation = await prisma.donation.create({
      data: {
        campaignId: campaign1.id,
        donorId: d.donor ? d.donor.id : null,
        amount: d.amount,
        stripePaymentId: d.reference + "_stripe",
        status: "SUCCESS",
        isAnonymous: !d.donor,
        donorName: d.name,
        donorEmail: d.email,
        message: d.message,
        taxReceiptGenerated: true,
        receiptUrl: `/receipts/${d.reference}.pdf`,
      },
    });

    // Create Donation Transaction
    await prisma.transaction.create({
      data: {
        donationId: donation.id,
        type: "DONATION",
        amount: d.amount,
        reference: d.reference,
        status: "SUCCESS",
        metadata: JSON.stringify({ campaignTitle: campaign1.title }),
      },
    });

    // Create Commission Transaction (10% platform commission)
    const commAmount = d.amount * 0.10;
    await prisma.transaction.create({
      data: {
        donationId: donation.id,
        type: "COMMISSION",
        amount: commAmount,
        reference: d.reference + "_comm",
        status: "SUCCESS",
        metadata: JSON.stringify({ rate: 0.10 }),
      },
    });
  }

  // Donations for Campaign 3 (Clean Water Initiative)
  const donationsCampaign3 = [
    { donor: donors[5], amount: 5000.0, reference: "txn_tb_c3_1", message: "Water is life. Clean water is a human right." },
    { donor: donors[6], amount: 2500.0, reference: "txn_tb_c3_2", message: "Happy to support clean water." },
    { donor: donors[7], amount: 3000.0, reference: "txn_tb_c3_3", message: "Sending support from England." },
    { donor: donors[8], amount: 750.0, reference: "txn_tb_c3_4", message: "Clean water kits change lives!" },
  ];

  for (const d of donationsCampaign3) {
    const donation = await prisma.donation.create({
      data: {
        campaignId: campaign3.id,
        donorId: d.donor.id,
        amount: d.amount,
        stripePaymentId: d.reference + "_stripe",
        status: "SUCCESS",
        isAnonymous: false,
        message: d.message,
        taxReceiptGenerated: true,
        receiptUrl: `/receipts/${d.reference}.pdf`,
      },
    });

    await prisma.transaction.create({
      data: {
        donationId: donation.id,
        type: "DONATION",
        amount: d.amount,
        reference: d.reference,
        status: "SUCCESS",
        metadata: JSON.stringify({ campaignTitle: campaign3.title }),
      },
    });
  }

  // Donations for Campaign 5 (Completed Health Camp)
  const donationsCampaign5 = [
    { donor: donors[9], amount: 10000.0, reference: "txn_tb_c5_1", message: "Healthcare for all!" },
    { donor: donors[0], amount: 5000.0, reference: "txn_tb_c5_2", message: "So proud to see this happen." },
  ];

  for (const d of donationsCampaign5) {
    const donation = await prisma.donation.create({
      data: {
        campaignId: campaign5.id,
        donorId: d.donor.id,
        amount: d.amount,
        stripePaymentId: d.reference + "_stripe",
        status: "SUCCESS",
        isAnonymous: false,
        message: d.message,
        taxReceiptGenerated: true,
        receiptUrl: `/receipts/${d.reference}.pdf`,
      },
    });

    await prisma.transaction.create({
      data: {
        donationId: donation.id,
        type: "DONATION",
        amount: d.amount,
        reference: d.reference,
        status: "SUCCESS",
        metadata: JSON.stringify({ campaignTitle: campaign5.title }),
      },
    });
  }

  console.log("Created Donations and Transactions.");

  // 6. Escrow Fund Flow Seeds (Withdrawal + Usage Proof for Completed Campaign 5)
  // Create withdrawal request from health trust
  const withdrawalRequest = await prisma.withdrawalRequest.create({
    data: {
      campaignId: campaign5.id,
      organizationId: orgNgo3.id,
      requestedAmount: 15000.0,
      purpose: "Procure generic medicines and contract cardiac testing vans for clinical checkup operations.",
      status: "DISBURSED",
      adminNote: "All documents matches. Funds dispatched to verify account.",
      proofUploaded: true,
      requestedAt: new Date("2026-04-10"),
      processedAt: new Date("2026-04-12"),
      disbursedAt: new Date("2026-04-13"),
    },
  });

  // Create Disbursement Transaction
  await prisma.transaction.create({
    data: {
      type: "WITHDRAWAL",
      amount: 15000.0,
      reference: "txn_tb_w5_disbursed",
      status: "SUCCESS",
      metadata: JSON.stringify({ campaignTitle: campaign5.title, withdrawalRequestId: withdrawalRequest.id }),
      createdAt: new Date("2026-04-13"),
    },
  });

  // Create Fund Usage Proofs
  await prisma.fundUsage.createMany({
    data: [
      {
        campaignId: campaign5.id,
        withdrawalRequestId: withdrawalRequest.id,
        item: "Antibiotics and Cardiac medicines block",
        description: "Bulk medicine invoice from HealthPharma Distributors.",
        amount: 8000.0,
        proofType: "INVOICE",
        proofFileUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80",
        status: "VERIFIED",
        uploadedAt: new Date("2026-04-20"),
      },
      {
        campaignId: campaign5.id,
        withdrawalRequestId: withdrawalRequest.id,
        item: "Medical Camp Site Photography",
        description: "Photos showing patient registrations and optician screening blocks.",
        amount: 0.0, // Media proof
        proofType: "PHOTO",
        proofFileUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=80",
        status: "VERIFIED",
        uploadedAt: new Date("2026-04-20"),
      },
      {
        campaignId: campaign5.id,
        withdrawalRequestId: withdrawalRequest.id,
        item: "Doctor stipends & transport voucher",
        description: "Receipt signatures from 12 consulting doctors.",
        amount: 7000.0,
        proofType: "BILL",
        proofFileUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80",
        status: "VERIFIED",
        uploadedAt: new Date("2026-04-21"),
      },
    ],
  });

  console.log("Created Withdrawal Requests and Fund Usages.");

  // 7. Seed Reviews
  await prisma.review.createMany({
    data: [
      {
        organizationId: orgNgo1.id,
        donorId: donors[0].id,
        rating: 5,
        comment: "Excellent responsiveness and clean communication on fund utilization plans.",
        isVerifiedDonor: true,
      },
      {
        organizationId: orgNgo2.id,
        donorId: donors[5].id,
        rating: 4,
        comment: "Clean water wells are highly needed. The team keeps updating photos regularly.",
        isVerifiedDonor: true,
      },
      {
        organizationId: orgNgo3.id,
        donorId: donors[9].id,
        rating: 5,
        comment: "Participated as volunteer in the health camp. Completely transparent handling of drugs and screening equipments.",
        isVerifiedDonor: true,
      },
    ],
  });

  // 8. Seed Notification
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: "New Organization Registered",
        message: "Clean Water Initiative has uploaded registration documents for review.",
        type: "COMPLAINT",
        isRead: false,
      },
      {
        userId: userNgo1.id,
        title: "Donation Received",
        message: "Sarah, your campaign 'Build 10 Schools in Rural Areas' received a $10,000 donation.",
        type: "DONATION",
        isRead: false,
      },
    ],
  });

  // 9. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        performedBy: "admin@trustbridge.com",
        action: "APPROVE_NGO",
        targetType: "ORGANIZATION",
        targetId: orgNgo1.id,
        details: JSON.stringify({ organizationName: orgNgo1.name, verificationTier: "GOLD" }),
        ipAddress: "127.0.0.1",
      },
      {
        performedBy: "admin@trustbridge.com",
        action: "DISBURSE_FUNDS",
        targetType: "WITHDRAWAL_REQUEST",
        targetId: withdrawalRequest.id,
        details: JSON.stringify({ amount: 15000.0, campaignTitle: campaign5.title }),
        ipAddress: "127.0.0.1",
      },
    ],
  });

  console.log("Created reviews, notifications, and audits.");
  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
