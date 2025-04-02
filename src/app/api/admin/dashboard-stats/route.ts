// app/api/admin/dashboard-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

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

    // Fetch all statistics in parallel
    const [
      totalUsers,
      usersByRole,
      totalEvents,
      totalBooks,
      totalArticles,
      totalPayments,
      paymentsByStatus,
      recentPayments,
      recentUsers,
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),

      // Users grouped by role
      prisma.user.groupBy({
        by: ["role"],
        _count: {
          id: true,
        },
      }),

      // Total events count
      prisma.event.count(),

      // Total books count
      prisma.book.count(),

      // Total articles count
      prisma.article.count(),

      // Total payments count
      prisma.payment.count(),

      // Payments grouped by status
      prisma.payment.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
      }),

      // Recent payments (limit to 5)
      prisma.payment.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          event: {
            select: {
              title: true,
            },
          },
        },
      }),

      // Recent users (limit to 5)
      prisma.user.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate total teachers count from usersByRole data
    const totalTeachers =
      usersByRole.find((item) => item.role === "TEACHER")?._count.id || 0;

    // Format usersByRole data for the frontend chart
    const formattedUsersByRole = usersByRole.map((item) => ({
      role: item.role,
      count: item._count.id,
    }));

    // Format paymentsByStatus data for the frontend chart
    const formattedPaymentsByStatus = paymentsByStatus.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    // Compile all statistics into a single response object
    const dashboardStats = {
      totalUsers,
      totalTeachers,
      totalEvents,
      totalBooks,
      totalArticles,
      totalPayments,
      usersByRole: formattedUsersByRole,
      paymentsByStatus: formattedPaymentsByStatus,
      recentPayments,
      recentUsers,
    };

    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
