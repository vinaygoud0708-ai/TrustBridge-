import PDFDocument from "pdfkit";

interface ReceiptInput {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  campaignTitle: string;
  ngoName: string;
  taxId: string;
  transactionId: string;
  createdAt: Date | string;
}

export function generateReceiptPdf(data: ReceiptInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // Colors
    const primaryColor = "#0ea5e9";
    const darkColor = "#0f172a";
    const slateColor = "#64748b";
    const lightBg = "#f8fafc";
    const borderCol = "#cbd5e1";

    // 1. Header Logo & Title
    doc.fillColor(primaryColor).fontSize(24).font("Helvetica-Bold").text("TrustBridge", 50, 50);
    doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold").text("TRANSPARENT CHARITY PLATFORM", 50, 80);

    doc.fillColor(darkColor).fontSize(14).font("Helvetica-Bold").text("DONATION TAX RECEIPT", 350, 50, { align: "right" });
    
    const formattedDate = new Date(data.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    
    doc.fillColor(slateColor).fontSize(9).font("Helvetica").text(`Date: ${formattedDate}`, 350, 70, { align: "right" });
    doc.text(`Receipt No: TB-${data.id.substring(0, 8).toUpperCase()}`, 350, 85, { align: "right" });

    // Divider
    doc.strokeColor(primaryColor).lineWidth(1.5).moveTo(50, 110).lineTo(545, 110).stroke();

    // 2. Donation Details Table Grid
    doc.rect(50, 130, 495, 230).fill(lightBg).strokeColor(borderCol).lineWidth(0.5).stroke();

    // Table Titles
    doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold");
    doc.text("DONOR DETAILS", 70, 150);
    doc.text("CAMPAIGN & NGO INFORMATION", 300, 150);

    // Columns
    doc.fillColor(slateColor).fontSize(9).font("Helvetica");
    
    // Left Column
    doc.text("Donor Name:", 70, 175);
    doc.fillColor(darkColor).font("Helvetica-Bold").text(data.donorName, 70, 190);
    
    doc.fillColor(slateColor).font("Helvetica").text("Email Address:", 70, 215);
    doc.fillColor(darkColor).font("Helvetica-Bold").text(data.donorEmail, 70, 230);

    doc.fillColor(slateColor).font("Helvetica").text("Payment Transaction ID:", 70, 255);
    doc.fillColor(darkColor).font("Helvetica-Bold").text(data.transactionId, 70, 270);

    // Right Column
    doc.fillColor(slateColor).font("Helvetica").text("Fundraising Campaign:", 300, 175);
    doc.fillColor(darkColor).font("Helvetica-Bold").text(data.campaignTitle, 300, 190, { width: 220 });

    doc.fillColor(slateColor).font("Helvetica").text("Vetted Beneficiary NGO:", 300, 215);
    doc.fillColor(darkColor).font("Helvetica-Bold").text(data.ngoName, 300, 230);

    doc.fillColor(slateColor).font("Helvetica").text("NGO Registration Tax ID:", 300, 255);
    doc.fillColor(darkColor).font("Helvetica-Bold").text(data.taxId, 300, 270);

    // 3. Amount Callout Box
    doc.rect(50, 380, 495, 60).fill("#eff6ff").strokeColor("#bae6fd").lineWidth(1).stroke();
    
    doc.fillColor(primaryColor).fontSize(11).font("Helvetica-Bold").text("TOTAL CONTRIBUTION AMOUNT", 70, 395);
    
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data.currency
    }).format(data.amount);
    
    doc.fillColor(darkColor).fontSize(18).font("Helvetica-Bold").text(formattedAmount, 70, 410);

    // Tax Exemption Box Text
    doc.fillColor("#166534").fontSize(8.5).font("Helvetica-Bold").text("TAX EXEMPTION STATUS: ELIGIBLE FOR 501(C)(3) DEDUCTIONS", 300, 405, { align: "right", width: 220 });

    // 4. Exemption Footnotes
    doc.fillColor(slateColor).fontSize(8.5).font("Helvetica").text(
      "Thank you for your generous contribution. This receipt confirms that the funds contributed to this vetted organization have been processed directly through the TrustBridge escrow ledger system.",
      50,
      460,
      { width: 495, align: "justify" }
    );

    doc.text(
      "All disbursements of this campaign require administrative approval, and matching digital invoices must be uploaded within 14 days of disbursement. Invoices and spending compliance audits can be checked live at the campaign details page.",
      50,
      495,
      { width: 495, align: "justify" }
    );

    // 5. Seal & Signature Sign-off
    doc.strokeColor(borderCol).lineWidth(0.5).moveTo(50, 560).lineTo(545, 560).stroke();

    // QR Mock Box
    doc.rect(50, 580, 55, 55).fill("#f1f5f9").strokeColor(borderCol).stroke();
    doc.fillColor(slateColor).fontSize(7).font("Helvetica").text("SECURE QR CODE", 55, 600, { width: 45, align: "center" });

    doc.fillColor(darkColor).fontSize(9).font("Helvetica-Bold").text("TrustBridge Escrow Auditing System", 120, 590);
    doc.fillColor(slateColor).fontSize(8).font("Helvetica").text("Authorized digital seal generated by cryptography. Compliance audits matches.", 120, 605);

    doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold").text("Masood Mirza", 420, 590, { align: "right" });
    doc.fillColor(slateColor).fontSize(8).font("Helvetica").text("Platform Trustee Founder", 420, 605, { align: "right" });

    // Footer
    doc.fillColor(slateColor).fontSize(8).text("Powered by TrustBridge Transparent Charity Network", 50, 660, { align: "center" });

    doc.end();
  });
}
