// src/app/api/user/update-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest) {
  let payload;
  try {
    payload = await request.json();
    console.log("Received payload:", payload);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return NextResponse.json(
      { message: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { id, currentPassword, newPassword } = payload;

  // Validate required fields
  if (!id || typeof id !== "string") {
    console.error("Missing user id");
    return NextResponse.json(
      { message: "User id is required" },
      { status: 400 }
    );
  }
  if (!currentPassword || !newPassword) {
    console.error("Missing current or new password");
    return NextResponse.json(
      { message: "Current password and new password are required" },
      { status: 400 }
    );
  }

  try {
    // Fetch user by id
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user || !user.password) {
      console.error("User not found or missing password");
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Compare provided current password with stored hash
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      console.error("Current password is incorrect");
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    console.log("Password updated successfully for user:", id);
    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { message: "Error updating password" },
      { status: 500 }
    );
  }
}
