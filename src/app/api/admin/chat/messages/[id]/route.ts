// app/api/admin/chat/messages/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Retrieve a single message with detailed information
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const messageId = params.id;

    // Fetch the message with related information
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            profileImage: true,
            role: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            adminId: true,
            admin: {
              select: {
                id: true,
                name: true,
                username: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Add context - get messages before and after this one
    let contextMessages = [];

    if (message.groupId) {
      // Get group context
      contextMessages = await prisma.message.findMany({
        where: {
          groupId: message.groupId,
          id: { not: messageId }, // Exclude the current message
          createdAt: {
            // Get messages within 15 minutes before or after
            gte: new Date(
              new Date(message.createdAt).getTime() - 15 * 60 * 1000
            ),
            lte: new Date(
              new Date(message.createdAt).getTime() + 15 * 60 * 1000
            ),
          },
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 10, // Limit to 10 context messages
      });
    } else if (message.senderId && message.receiverId) {
      // Get private chat context
      contextMessages = await prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: message.senderId,
              receiverId: message.receiverId,
            },
            {
              senderId: message.receiverId,
              receiverId: message.senderId,
            },
          ],
          id: { not: messageId }, // Exclude the current message
          createdAt: {
            // Get messages within 15 minutes before or after
            gte: new Date(
              new Date(message.createdAt).getTime() - 15 * 60 * 1000
            ),
            lte: new Date(
              new Date(message.createdAt).getTime() + 15 * 60 * 1000
            ),
          },
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 10, // Limit to 10 context messages
      });
    }

    return NextResponse.json({
      message,
      context: {
        messages: contextMessages,
      },
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const messageId = params.id;

    // Check if message exists
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Delete message
    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json(
      { message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}

// PUT: Update a message (limited functionality for admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const messageId = params.id;
    const body = await request.json();
    const { isRead, expiresAt } = body;

    // Check if message exists
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Prepare update data - admins can only update certain fields
    const updateData: any = {};

    if (isRead !== undefined) {
      updateData.isRead = isRead;
    }

    if (expiresAt) {
      updateData.expiresAt = new Date(expiresAt);
    }

    // Return error if no valid fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid update fields provided" },
        { status: 400 }
      );
    }

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: updateData,
      include: {
        sender: {
          select: {
            name: true,
            username: true,
          },
        },
        receiver: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}
