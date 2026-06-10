import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { z } from "zod";
import { sendOTPEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["DONOR", "CHARITY"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    
    if (!parsed.success) {
      const errors = parsed.error.issues.map(e => e.message).join(", ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { name, email, phone, password, role } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json({ error: "An account already exists with this email address." }, { status: 400 });
      }
      
      // If user exists but is not verified, we can reuse the record and generate a new OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const hashedPassword = bcryptjs.hashSync(password, 12);
      
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          phone: phone || null,
          password: hashedPassword,
          role,
          otp: otpCode,
          otpExpiry: otpExpiryTime,
        },
      });

      console.log(`[TRUSTBRIDGE SYSTEM OTP] Re-sent verification code ${otpCode} to ${normalizedEmail}`);
      try {
        await sendOTPEmail(normalizedEmail, name, otpCode);
      } catch (emailErr) {
        console.error("Failed to send OTP verification email:", emailErr);
      }
      return NextResponse.json({ 
        success: true, 
        message: "Registration updated. Verification OTP sent.",
        email: normalizedEmail 
      });
    }

    // Generate new OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const hashedPassword = bcryptjs.hashSync(password, 12);

    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone: phone || null,
        password: hashedPassword,
        role,
        isVerified: false,
        otp: otpCode,
        otpExpiry: otpExpiryTime,
      },
    });

    console.log(`[TRUSTBRIDGE SYSTEM OTP] Generated verification code ${otpCode} for ${normalizedEmail}`);
    try {
      await sendOTPEmail(normalizedEmail, name, otpCode);
    } catch (emailErr) {
      console.error("Failed to send OTP verification email:", emailErr);
    }

    return NextResponse.json({ 
      success: true, 
      message: "User account created. Verification OTP sent.",
      email: normalizedEmail 
    });
  } catch (error) {
    console.error("REGISTER_API_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
