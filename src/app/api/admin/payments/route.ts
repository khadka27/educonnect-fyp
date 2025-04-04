// app/api/admin/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Fetch all payments with filters and pagination
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
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";
    const method = searchParams.get("method") || "";
    const userId = searchParams.get("userId") || "";
    const eventId = searchParams.get("eventId") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Prepare filters
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (method) {
      where.method = method;
    }

    if (userId) {
      where.userId = userId;
    }

    if (eventId) {
      where.eventId = eventId;
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

    // Fetch payments with pagination
    const [payments, totalPayments] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    // Calculate pagination data
    const totalPages = Math.ceil(totalPayments / limit);

    // Calculate payment statistics
    const stats = await prisma.$transaction([
      // Total amount by status
      prisma.payment.groupBy({
        by: ["status"],
        _sum: { amount: true },
        _count: true,
        orderBy: undefined,
      }),
      // Total amount by payment method
      prisma.payment.groupBy({
        by: ["method"],
        _sum: { amount: true },
        _count: true,
        orderBy: undefined,
      }),
    ]);

    // Format statistics
    const statistics = {
      byStatus: stats[0].map((item) => ({
        status: item.status,
        count: item._count,
        totalAmount: item._sum.amount,
      })),
      byMethod: stats[1].map((item) => ({
        method: item.method,
        count: item._count,
        totalAmount: item._sum.amount,
      })),
      totalAmount: stats[0].reduce(
        (sum, item) => sum + (item._sum.amount || 0),
        0
      ),
      totalCount: totalPayments,
    };

    return NextResponse.json({
      payments,
      statistics,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalPayments,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST: Create a manual payment record (admin can create payments manually)
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
    const {
      transactionId,
      userId,
      eventId,
      amount,
      status,
      method,
      paymentGateway,
    } = body;

    // Validate required fields
    if (
      !transactionId ||
      !userId ||
      !eventId ||
      !amount ||
      !status ||
      !method ||
      !paymentGateway
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check for duplicate transaction ID
    const existingPayment = await prisma.payment.findUnique({
      where: { transactionId },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Transaction ID already exists" },
        { status: 409 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        transactionId,
        userId,
        eventId,
        amount,
        status,
        method,
        paymentGateway,
        createdAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            title: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

// PATCH: Update multiple payment statuses at once (batch operations)
export async function PATCH(request: NextRequest) {
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
    const { paymentIds, status, failureReason } = body;

    // Validate required fields
    if (
      !paymentIds ||
      !Array.isArray(paymentIds) ||
      paymentIds.length === 0 ||
      !status
    ) {
      return NextResponse.json(
        { error: "Payment IDs array and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    if (!["PENDING", "COMPLETED", "FAILED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be PENDING, COMPLETED, or FAILED" },
        { status: 400 }
      );
    }

    // Add failureReason if status is FAILED
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "FAILED" && failureReason) {
      updateData.failureReason = failureReason;
    }

    // Update payments
    const { count } = await prisma.payment.updateMany({
      where: {
        id: { in: paymentIds },
      },
      data: updateData,
    });

    return NextResponse.json({
      message: `Successfully updated ${count} payments to ${status}`,
      updatedCount: count,
    });
  } catch (error) {
    console.error("Error updating payments:", error);
    return NextResponse.json(
      { error: "Failed to update payments" },
      { status: 500 }
    );
  }
}
