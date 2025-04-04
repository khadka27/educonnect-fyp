// app/api/admin/payments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Fetch a single payment by ID
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

    const paymentId = params.id;

    // Fetch payment by ID with detailed info
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            profileImage: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            date: true,
            location: true,
            price: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}

// PUT: Update a payment record
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

    const paymentId = params.id;
    const body = await request.json();
    const { 
      transactionId, 
      status, 
      amount, 
      method, 
      paymentGateway,
      failureReason
    } = body;

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // If changing transactionId, check it doesn't conflict
    if (transactionId && transactionId !== payment.transactionId) {
      const conflictingPayment = await prisma.payment.findFirst({
        where: {
          transactionId,
          id: { not: paymentId },
        },
      });

      if (conflictingPayment) {
        return NextResponse.json(
          { error: "Transaction ID already exists" },
          { status: 409 }
        );
      }
    }

    // Validate status
    if (status && !["PENDING", "COMPLETED", "FAILED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be PENDING, COMPLETED, or FAILED" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (transactionId) updateData.transactionId = transactionId;
    if (status) updateData.status = status;
    if (amount !== undefined) updateData.amount = amount;
    if (method) updateData.method = method;
    if (paymentGateway) updateData.paymentGateway = paymentGateway;
    
    // Set failureReason if status is FAILED
    if (status === "FAILED") {
      updateData.failureReason = failureReason || null;
    } else if (status === "COMPLETED") {
      // Clear failureReason if status is now COMPLETED
      updateData.failureReason = null;
    }

    // Set updatedAt
    updateData.updatedAt = new Date();

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
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

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a payment record
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

    const paymentId = params.id;

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Delete payment
    await prisma.payment.delete({
      where: { id: paymentId },
    });

    return NextResponse.json(
      { message: "Payment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    );
  }
}