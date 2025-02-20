// import { NextResponse } from "next/server";

// // Function to verify payment using Khalti's lookup API
// async function verifyKhaltiPayment(pidx: string) {
//   try {
//     const response = await fetch(
//       "https://a.khalti.com/api/v2/epayment/lookup/",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Key ${process.env.NEXT_PUBLIC_KHALTI_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ pidx }),
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error("Khalti Lookup API Error:", errorData);
//       throw new Error(`Khalti Lookup API Error: ${JSON.stringify(errorData)}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error verifying payment:", error);
//     throw new Error("Payment verification failed.");
//   }
// }

// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const params = new URLSearchParams(url.search);

//     const method = params.get("method");
//     const pidx = params.get("pidx");
//     const transactionId = params.get("transaction_id");
//     const amount = params.get("amount");
//     const status = params.get("status");

//     // Validate required parameters
//     if (!pidx || !transactionId || !amount || !status) {
//       return NextResponse.json(
//         { error: "Missing required parameters" },
//         { status: 400 }
//       );
//     }

//     if (status !== "Completed") {
//       return NextResponse.json(
//         { error: "Payment not completed" },
//         { status: 400 }
//       );
//     }

//     // Verify transaction with Khalti
//     const lookupData = await verifyKhaltiPayment(pidx);
//     if (lookupData.status !== "Completed") {
//       return NextResponse.json(
//         { error: "Payment not confirmed by Khalti" },
//         { status: 400 }
//       );
//     }

//     // Instead of returning JSON, redirect to a friendly success page
//     const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?transaction_id=${transactionId}`;
//     return NextResponse.redirect(redirectUrl);
//   } catch (error) {
//     console.error("Error processing payment success:", error);
//     return NextResponse.json(
//       {
//         error: "Payment confirmation failed",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// File: app/api/success/route.ts
// File: app/api/success/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import {
  PaymentMethod,
  PaymentGateway,
  PaymentStatus,
  EventType,
} from "@prisma/client";

// Function to verify payment using Khalti's lookup API
async function verifyKhaltiPayment(pidx: string) {
  try {
    const response = await fetch(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.NEXT_PUBLIC_KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pidx }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Khalti Lookup API Error:", errorData);
      throw new Error(`Khalti Lookup API Error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw new Error("Payment verification failed.");
  }
}

export async function GET(req: Request) {
  try {
    // Parse URL and query parameters
    const url = new URL(req.url);
    const params = new URLSearchParams(url.search);
    const session = await getServerSession(authOptions);

    // Default method to "khalti" if missing
    const methodParam = params.get("method") || "khalti";
    const pidx = params.get("pidx");
    const transactionId = params.get("transaction_id");
    const amount = params.get("amount");
    const status = params.get("status");
    const purchaseOrderId = params.get("purchase_order_id");
    const purchaseOrderName = params.get("purchase_order_name");

    // Validate required parameters
    if (
      !pidx ||
      !transactionId ||
      !amount ||
      !status ||
      !purchaseOrderId ||
      !purchaseOrderName
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (status !== "Completed") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Verify transaction with Khalti Lookup API
    const lookupData = await verifyKhaltiPayment(pidx);
    if (lookupData.status !== "Completed") {
      return NextResponse.json(
        { error: "Payment not confirmed by Khalti" },
        { status: 400 }
      );
    }

    // Convert the method string to uppercase and cast to enums
    const methodUpper = methodParam.toUpperCase();
    if (methodUpper !== "KHALTI" && methodUpper !== "ESEWA") {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }
    const paymentMethodEnum: PaymentMethod = methodUpper as PaymentMethod;
    const paymentGatewayEnum: PaymentGateway = methodUpper as PaymentGateway;
    // Set status to COMPLETED (from PaymentStatus enum)
    const completedStatus: PaymentStatus = PaymentStatus.COMPLETED;

    // Extract eventId from purchaseOrderId assuming format "txn_<timestamp>_<eventId>"
    const parts = purchaseOrderId.split("_");
    const eventId = parts[2] || "unknown";

    // Convert amount from paisa to NPR
    const numericAmount = parseFloat(amount) / 100;

    // Get userId from session (if available)
    const userId = session?.user?.id || "";

    // Create a Payment record in the database
    const newPayment = await prisma.payment.create({
      data: {
        transactionId: purchaseOrderId, // using purchaseOrderId as unique transaction identifier
        userId,
        eventId,
        amount: numericAmount,
        status: completedStatus,
        method: paymentMethodEnum,
        paymentGateway: paymentGatewayEnum,
      },
    });
    console.log("Payment stored:", newPayment);

    // For premium events, also store a Registration record
    // We'll assume registration details (name, email, phone) are stored in the session.
    if (
      paymentMethodEnum === PaymentMethod.KHALTI ||
      paymentMethodEnum === PaymentMethod.ESEWA
    ) {
      // Assume that a premium event means event type PREMIUM.
      const newRegistration = await prisma.registration.create({
        data: {
          name: session?.user?.name || "Unknown",
          email: session?.user?.email || "",
          phone: session?.user?.phone || "",
          eventId,
          eventType: EventType.PREMIUM, // since this is for premium events
          paymentStatus: completedStatus, // PaymentStatus enum, COMPLETED in this case
          transactionId: transactionId, // use the transaction id from Khalti
        },
      });
      console.log("Registration stored:", newRegistration);
    }

    // Redirect the user to a friendly thank-you page with the transaction id
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?transaction_id=${transactionId}`;
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error processing payment success:", error);
    return NextResponse.json(
      {
        error: "Payment confirmation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
