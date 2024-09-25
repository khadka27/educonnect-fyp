// src/app/api/messages/chat/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import based on your prisma setup

export async function POST(req: Request) {
  const { content, senderId, receiverId } = await req.json();

  // Validate the required fields
  if (!content || !senderId || !receiverId) {
    return NextResponse.json(
      { success: false, message: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
      },
    });

    // Send back the created message
    return NextResponse.json({ success: true, data: newMessage }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to send message." }, { status: 500 });
  }
}
