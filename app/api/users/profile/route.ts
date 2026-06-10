import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcryptjs from "bcryptjs";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const duplicate = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (duplicate) {
        return NextResponse.json({ error: "Email is already taken by another account." }, { status: 400 });
      }
      updateData.email = normalizedEmail;
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password." }, { status: 400 });
      }

      const isMatch = bcryptjs.compareSync(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Incorrect current password." }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 });
      }

      updateData.password = bcryptjs.hashSync(newPassword, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error("PUT_USER_PROFILE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete user from database (Cascade deletes notifications, organization, etc.)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    console.log(`[USER_ACCOUNTS] Deleted user account: ID = ${session.user.id}`);
    return NextResponse.json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    console.error("DELETE_USER_PROFILE_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
