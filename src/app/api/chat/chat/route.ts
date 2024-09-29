import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the path as needed

export async function POST(request: Request) {
  const { content, senderId, receiverId, fileUrl, fileType, groupId } =
    await request.json();

  try {
    const messageData: any = {
      content,
      senderId,
      fileUrl,
      fileType,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Set expiry to 24 hours
    };

    if (groupId) {
      messageData.isGroupMessage = true;
      messageData.groupId = groupId;
    } else {
      messageData.receiverId = receiverId;
    }

    const message = await prisma.message.create({
      data: messageData,
    });

    // Note: Emitting the message via WebSocket would be handled separately

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error saving message to database:", error);
    return NextResponse.json(
      { error: "Failed to save message." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");
  const userId = searchParams.get("userId");

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ receiverId: userId }, { groupId: groupId }],
    },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}
