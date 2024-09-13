// src/app/api/user/verify-password.ts
import { NextApiRequest, NextApiResponse } from "next";
import {prisma} from "@/lib/prisma"; // Adjust the path based on your project structure
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { id, password } = req.body;

  try {
    // Fetch user by ID
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user || !user.password) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare provided password with the stored hash
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ match: false });
    }

    return res.status(200).json({ match: true });
  } catch (error) {
    return res.status(500).json({ message: "Error verifying password" });
  }
}
