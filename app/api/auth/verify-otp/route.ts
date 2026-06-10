import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP code are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json({ error: "No active verification requests found" }, { status: 400 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: "The verification code is incorrect." }, { status: 400 });
    }

    if (new Date() > user.otpExpiry) {
      return NextResponse.json({ error: "The verification code has expired. Please register again." }, { status: 400 });
    }

    // OTP is valid! Verify user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Email verified successfully. You can now login." 
    });
  } catch (error) {
    console.error("VERIFY_OTP_API_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
