import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcryptjs from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Email, OTP code, and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json({ error: "No active password reset requests found" }, { status: 400 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: "The verification code is incorrect." }, { status: 400 });
    }

    if (new Date() > user.otpExpiry) {
      return NextResponse.json({ error: "The verification code has expired." }, { status: 400 });
    }

    // Hash and update password
    const hashedPassword = bcryptjs.hashSync(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null,
        isVerified: true, // Auto verify if they reset password successfully
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Password reset successfully. You can now login with your new password." 
    });
  } catch (error) {
    console.error("RESET_PASSWORD_API_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
