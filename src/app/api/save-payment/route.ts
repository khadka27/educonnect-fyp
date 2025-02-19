import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const paymentData = await req.json();
    // Expected payload:
    // {
    //   method,      // e.g., "khalti"
    //   pidx,        // Khalti payment identifier (not used in model here)
    //   transactionId, // Transaction id from Khalti (could be separate)
    //   amount,      // amount in paisa (e.g., "1000")
    //   status,      // e.g., "Completed"
    //   purchaseOrderId, // e.g., "txn_<timestamp>_<eventId>"
    //   purchaseOrderName, // e.g., event title (optional)
    // }
    const {
      method,
      pidx,
      transactionId,
      amount,
      status,
      purchaseOrderId,
      purchaseOrderName,
    } = paymentData;

    // Validate required fields
    if (!purchaseOrderId || !transactionId || !amount || !status || !method) {
      return NextResponse.json(
        { error: "Missing required payment fields" },
        { status: 400 }
      );
    }

    // Extract eventId from purchaseOrderId assuming the format "txn_<timestamp>_<eventId>"
    const parts = purchaseOrderId.split("_");
    const eventId = parts[2] || "";
    if (!eventId) {
      return NextResponse.json(
        { error: "Invalid purchase order id format, eventId missing" },
        { status: 400 }
      );
    }

    // Convert amount from string to number and from paisa to NPR
    const numericAmount = parseFloat(amount) / 100;

    // Set paymentGateway as uppercase of method (e.g., "KHALTI")
    const paymentGateway = method.toUpperCase();

    // For userId, in a real scenario, you should get this from the authenticated session.
    // Here, we use a placeholder.
    const userId = "unknown";

    const newPayment = await prisma.payment.create({
      data: {
        transactionId: purchaseOrderId, // Using purchaseOrderId as the unique transaction ID
        userId,
        eventId,
        amount: numericAmount,
        status: status as any, // Cast as needed if PaymentStatus is an enum
        method,
        paymentGateway,
        // Optionally, you can store additional fields like failureReason if provided.
      },
    });

    return NextResponse.json({ success: true, payment: newPayment });
  } catch (error) {
    console.error("Error saving payment:", error);
    return NextResponse.json(
      {
        error: "Failed to save payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
