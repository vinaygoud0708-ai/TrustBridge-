import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOTPEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // To prevent user enumeration, we return success even if user doesn't exist
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: "If the email is registered, a password reset code has been sent." 
      });
    }

    // Generate reset OTP
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp: resetOtp,
        otpExpiry: expiryTime,
      },
    });

    console.log(`[TRUSTBRIDGE SYSTEM OTP] Generated password reset code ${resetOtp} for ${normalizedEmail}`);
    try {
      await sendOTPEmail(normalizedEmail, user.name, resetOtp);
    } catch (emailErr) {
      console.error("Failed to send password reset email:", emailErr);
    }

    return NextResponse.json({ 
      success: true, 
      message: "If the email is registered, a password reset code has been sent.",
      email: normalizedEmail // Return email to assist multi-step client wizards
    });
  } catch (error) {
    console.error("FORGOT_PASSWORD_API_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
