// app/api/admin/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Retrieve chat statistics for admin dashboard
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
    const period = searchParams.get("period") || "week"; // day, week, month, year
    
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7); // default to week
    }

    // Collect chat statistics in parallel
    const [
      totalMessages,
      totalGroups,
      messagesByDay,
      topActiveUsers,
      topActiveGroups,
      mediaStats,
    ] = await Promise.all([
      // Total messages
      prisma.message.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),
      
      // Total groups
      prisma.group.count(),
      
      // Messages grouped by day
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date, 
          COUNT(*) as count 
        FROM message 
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at) 
        ORDER BY date
      `,
      
      // Top 5 most active users by message count
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          profileImage: true,
          _count: {
            select: {
              messages: {
                where: {
                  createdAt: {
                    gte: startDate,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          messages: {
            _count: "desc",
          },
        },
        take: 5,
      }),
      
      // Top 5 most active groups by message count
      prisma.group.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              messages: {
                where: {
                  createdAt: {
                    gte: startDate,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          messages: {
            _count: "desc",
          },
        },
        take: 5,
      }),
      
      // Media message statistics
      prisma.message.groupBy({
        by: ['fileType'],
        where: {
          fileUrl: {
            not: null,
          },
          createdAt: {
            gte: startDate,
          },
        },
        _count: true,
      }),
    ]);

    // Format top active users
    const formattedTopUsers = topActiveUsers.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      profileImage: user.profileImage,
      messageCount: user._count.messages,
    }));

    // Format top active groups
    const formattedTopGroups = topActiveGroups.map(group => ({
      id: group.id,
      name: group.name,
      messageCount: group._count.messages,
    }));

    // Return compiled statistics
    return NextResponse.json({
      totalMessages,
      totalGroups,
      messagesByDay,
      topActiveUsers: formattedTopUsers,
      topActiveGroups: formattedTopGroups,
      mediaStats,
      period,
      dateRange: {
        start: startDate,
        end: now,
      },
    });
  } catch (error) {
    console.error("Error fetching chat statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat statistics" },
      { status: 500 }
    );
  }
}

// POST: Moderate messages (mark as hidden/inappropriate)
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
    const { messageIds, action, reason } = body;

    // Validate required fields
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0 || !action) {
      return NextResponse.json(
        { error: "Message IDs array and action are required" },
        { status: 400 }
      );
    }

    // Handle different moderation actions
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
          count: result.count,
        });
        
      case "expire":
        // Expire the messages immediately
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
          count: result.count,
        });
        
      default:
        return NextResponse.json(
          { error: "Invalid action. Supported actions: delete, expire" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error moderating messages:", error);
    return NextResponse.json(
      { error: "Failed to moderate messages" },
      { status: 500 }
    );
  }
}