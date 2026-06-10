import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcryptjs from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { organization: true },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        // OTP verification path
        if (credentials.otp) {
          if (!user.otp || !user.otpExpiry) {
            throw new Error("No active OTP code requested");
          }

          if (user.otp !== credentials.otp) {
            throw new Error("Invalid OTP code");
          }

          if (new Date() > user.otpExpiry) {
            throw new Error("OTP code has expired");
          }

          // OTP is valid! Mark user as verified if they weren't
          if (!user.isVerified) {
            await prisma.user.update({
              where: { id: user.id },
              data: { isVerified: true, otp: null, otpExpiry: null },
            });
          } else {
            // Clear OTP
            await prisma.user.update({
              where: { id: user.id },
              data: { otp: null, otpExpiry: null },
            });
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: true,
            orgId: user.organization?.id || null,
          };
        }

        // Standard Password verification path
        if (!credentials.password) {
          throw new Error("Password is required");
        }

        const isPasswordMatch = bcryptjs.compareSync(credentials.password, user.password);
        if (!isPasswordMatch) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          orgId: user.organization?.id || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.orgId = user.orgId;
      }
      
      // Support session updates (e.g. after organization verification or wizard completion)
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.orgId = (token.orgId as string) || null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
