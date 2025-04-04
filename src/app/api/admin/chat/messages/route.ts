// app/api/admin/chat/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: List messages with advanced filtering options
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const userId = searchParams.get("userId") || "";
    const groupId = searchParams.get("groupId") || "";
    const hasFiles = searchParams.get("hasFiles") || "";
    const isGroupMessage = searchParams.get("isGroupMessage") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Prepare filters
    const where: any = {};
    
    if (search) {
      where.content = { contains: search, mode: "insensitive" };
    }

    if (userId) {
      where.OR = [
        { senderId: userId },
        { receiverId: userId },
      ];
    }

    if (groupId) {
      where.groupId = groupId;
    }

    if (hasFiles === "true") {
      where.fileUrl = { not: null };
    } else if (hasFiles === "false") {
      where.fileUrl = null;
    }

    if (isGroupMessage === "true") {
      where.isGroupMessage = true;
    } else if (isGroupMessage === "false") {
      where.isGroupMessage = false;
    }
    
    // Date range filtering
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.createdAt = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.createdAt = {
        lte: new Date(endDate),
      };
    }

    // Fetch messages with pagination
    const [messages, totalMessages] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              profileImage: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              profileImage: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.message.count({ where }),
    ]);

    // Calculate pagination data
    const totalPages = Math.ceil(totalMessages / limit);

    return NextResponse.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalMessages,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST: Perform batch actions on messages
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { messageIds, action } = body;

    // Validate required fields
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: "Message IDs array is required" },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "delete":
        // Delete the specified messages
        result = await prisma.message.deleteMany({
          where: {
            id: { in: messageIds },
          },
        });
        
        return NextResponse.json({
          message: `Successfully deleted ${result.count} messages`,
          deletedCount: result.count,
        });
        
      case "markRead":
        // Mark messages as read
        result = await prisma.message.updateMany({
          where: {
            id: { in: messageIds },
          },
          data: {
            isRead: true,
          },
        });
        
        return NextResponse.json({
          message: `Successfully marked ${result.count} messages as read`,
          updatedCount: result.count,
        });
        
      case "expire":
        // Expire messages immediately
        result = await prisma.message.updateMany({
          where: {
            id: { in: messageIds },
          },
          data: {
            expiresAt: new Date(),
          },
        });
        
        return NextResponse.json({
          message: `Successfully expired ${result.count} messages`,
          updatedCount: result.count,
        });
        
      default:
        return NextResponse.json(
          { error: "Invalid action. Supported actions: delete, markRead, expire" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing messages:", error);
    return NextResponse.json(
      { error: "Failed to process messages" },
      { status: 500 }
    );
  }
}