// src/app/api/messages/history/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import based on your prisma setup

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const senderId = searchParams.get("senderId");
  const receiverId = searchParams.get("receiverId");

  // Validate the required fields
  if (!senderId || !receiverId) {
    return NextResponse.json(
      { success: false, message: "Sender ID and Receiver ID are required." },
      { status: 400 }
    );
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ success: true, data: messages }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to fetch messages." }, { status: 500 });
  }
}
