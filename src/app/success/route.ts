import { NextResponse } from "next/server";

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
    const url = new URL(req.url);
    const params = new URLSearchParams(url.search.replace("?", "&")); // Ensure correct parsing

    const method = params.get("method");
    const pidx = params.get("pidx");
    const transactionId = params.get("transaction_id");
    const amount = params.get("amount");
    const status = params.get("status");

    if (!pidx || !transactionId || !amount || !status) {
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

    // Verify transaction with Khalti
    const lookupData = await verifyKhaltiPayment(pidx);
    if (lookupData.status !== "Completed") {
      return NextResponse.json(
        { error: "Payment not confirmed by Khalti" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Payment successful", transactionId },
      { status: 200 }
    );
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
