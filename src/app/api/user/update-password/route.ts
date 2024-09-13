// src/app/api/user/update-password.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { id, currentPassword, newPassword } = req.body;

  try {
    // Fetch user by ID
    const user = await prisma.user.findUnique({
      where: { id },
    });

    console.log("userrrrrrrrrr", user);

    if (!user || !user.password) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare provided current password with stored hash
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user with new password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Error updating password" });
  }
}
