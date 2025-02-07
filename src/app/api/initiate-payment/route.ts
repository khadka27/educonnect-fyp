import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { generateEsewaSignature } from "@/lib/generateEsewaSignature";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentRequestData } from "src/types/types";

function validateEnvironmentVariables() {
  const requiredEnvVars = [
    "NEXT_PUBLIC_BASE_URL",
    "NEXT_PUBLIC_ESEWA_MERCHANT_CODE",
    "NEXT_PUBLIC_ESEWA_SECRET_KEY",
    "NEXT_PUBLIC_KHALTI_SECRET_KEY",
  ];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing environment variable: ${envVar}`);
    }
  }
}

export async function POST(req: Request) {
  try {
    validateEnvironmentVariables();
    const paymentData: PaymentRequestData = await req.json();
    const { amount, productName, transactionId, method, userId, eventId } =
      paymentData;

    if (!amount || !productName || !transactionId || !method) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a pending payment entry in the database
    const payment = await prisma.payment.create({
      data: {
        transactionId,
        userId,
        eventId,
        amount: parseFloat(amount),
        status: "pending",
        method,
        paymentGateway: method,
      },
    });

    switch (method as PaymentMethod) {
      case "esewa": {
        const transactionUuid = `${Date.now()}-${uuidv4()}`;
        const esewaConfig = {
          amount: amount,
          tax_amount: "0",
          total_amount: amount,
          transaction_uuid: transactionUuid,
          product_code: process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE,
          product_service_charge: "0",
          product_delivery_charge: "0",
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?transactionId=${transactionId}`,
          failure_url: `${process.env.NEXT_PUBLIC_BASE_URL}/failure?transactionId=${transactionId}`,
          signed_field_names: "total_amount,transaction_uuid,product_code",
        };

        const signatureString = `total_amount=${esewaConfig.total_amount},transaction_uuid=${esewaConfig.transaction_uuid},product_code=${esewaConfig.product_code}`;
        const signature = generateEsewaSignature(
          process.env.NEXT_PUBLIC_ESEWA_SECRET_KEY!,
          signatureString
        );

        return NextResponse.json({
          esewaConfig: {
            ...esewaConfig,
            signature,
          },
        });
      }

      case "khalti": {
        const khaltiConfig = {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?transactionId=${transactionId}`,
          amount: Math.round(parseFloat(amount) * 100),
          purchase_order_id: transactionId,
          purchase_order_name: productName,
          customer_info: {
            name: "Customer Name", // Replace with actual customer info
            email: "customer@example.com",
            phone: "9800000000",
          },
        };

        const response = await fetch(
          "https://a.khalti.com/api/v2/epayment/initiate/",
          {
            method: "POST",
            headers: {
              Authorization: `Key ${process.env.NEXT_PUBLIC_KHALTI_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(khaltiConfig),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Khalti payment initiation failed: ${JSON.stringify(errorData)}`
          );
        }

        const khaltiResponse = await response.json();
        return NextResponse.json({
          khaltiPaymentUrl: khaltiResponse.payment_url,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid payment method" },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("Payment API Error:", err);
    return NextResponse.json(
      {
        error: "Error initiating payment",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
