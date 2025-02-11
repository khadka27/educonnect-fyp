// import { NextResponse } from "next/server";
// import { v4 as uuidv4 } from "uuid";
// import { generateEsewaSignature } from "@/lib/generateEsewaSignature";

// function validateEnvironmentVariables() {
//   const requiredEnvVars = [
//     "NEXT_PUBLIC_BASE_URL",
//     "NEXT_PUBLIC_ESEWA_MERCHANT_CODE",
//     "NEXT_PUBLIC_ESEWA_SECRET_KEY",
//     "NEXT_PUBLIC_KHALTI_SECRET_KEY",
//   ];

//   for (const envVar of requiredEnvVars) {
//     if (!process.env[envVar]) {
//       throw new Error(`Missing environment variable: ${envVar}`);
//     }
//   }
// }

// export async function POST(req: Request) {
//   try {
//     validateEnvironmentVariables();

//     const { amount, productName, transactionId, method } = await req.json();

//     if (!amount || !productName || !transactionId || !method) {
//       return NextResponse.json(
//         {
//           error:
//             "Missing required fields (amount, productName, transactionId, method)",
//         },
//         { status: 400 }
//       );
//     }

//     switch (method.toLowerCase()) {
//       case "esewa": {
//         const transactionUuid = `${Date.now()}-${uuidv4()}`;
//         const esewaConfig = {
//           amt: amount,
//           psc: 0,
//           pdc: 0,
//           txAmt: 0,
//           tAmt: amount,
//           pid: transactionId,
//           scd: process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE!,
//           su: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
//           fu: `${process.env.NEXT_PUBLIC_BASE_URL}/failure`,
//         };

//         // Generate signature
//         const signatureString = `amt=${esewaConfig.amt}&pid=${esewaConfig.pid}&scd=${esewaConfig.scd}`;
//         const signature = generateEsewaSignature(
//           process.env.NEXT_PUBLIC_ESEWA_SECRET_KEY!,
//           signatureString
//         );

//         return NextResponse.json({
//           esewaPaymentUrl: "https://uat.esewa.com.np/epay/main",
//           esewaPayload: {
//             ...esewaConfig,
//             signature,
//           },
//         });
//       }

//       case "khalti": {
//         const khaltiConfig = {
//           return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?method=khalti`,
//           website_url: process.env.NEXT_PUBLIC_BASE_URL!,
//           amount: Math.round(parseFloat(amount) * 100), // Convert amount to paisa
//           purchase_order_id: transactionId,
//           purchase_order_name: productName,
//         };

//         const response = await fetch(
//           "https://a.khalti.com/api/v2/epayment/initiate/",
//           {
//             method: "POST",
//             headers: {
//               Authorization: `Key ${process.env.NEXT_PUBLIC_KHALTI_SECRET_KEY}`,
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(khaltiConfig),
//           }
//         );

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(`Khalti API Error: ${JSON.stringify(errorData)}`);
//         }

//         const khaltiResponse = await response.json();
//         return NextResponse.json({
//           khaltiPaymentUrl: khaltiResponse.payment_url,
//         });
//       }

//       default:
//         return NextResponse.json(
//           { error: "Invalid payment method. Use 'esewa' or 'khalti'." },
//           { status: 400 }
//         );
//     }
//   } catch (err) {
//     console.error("Error initiating payment:", err);
//     return NextResponse.json(
//       {
//         error: "Payment initiation failed",
//         details: err instanceof Error ? err.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";

// Helper to validate necessary environment variables
function validateEnvironmentVariables() {
  const requiredEnvVars = [
    "NEXT_PUBLIC_BASE_URL",
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
    // Validate required environment variables
    validateEnvironmentVariables();

    // Parse incoming request body
    const paymentData = await req.json();
    const { amount, productName, transactionId, method } = paymentData;

    // Validate request body
    if (!amount || !productName || !transactionId || !method) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: amount, productName, transactionId, or method",
        },
        { status: 400 }
      );
    }

    if (method.toLowerCase() === "khalti") {
      const khaltiConfig = {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?method=khalti`,
        website_url: process.env.NEXT_PUBLIC_BASE_URL!,
        amount: Math.round(Number(amount) * 100), // Ensure amount is in paisa (integer format)
        purchase_order_id: transactionId,
        purchase_order_name: productName,
      };

      // API endpoint for Khalti (Use sandbox during development)
      const KHALTI_API_URL = "https://dev.khalti.com/api/v2/epayment/initiate/";

      // Send POST request to Khalti
      const response = await fetch(KHALTI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.NEXT_PUBLIC_KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(khaltiConfig),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Khalti API Error:", errorData);
        throw new Error(`Khalti API Error: ${JSON.stringify(errorData)}`);
      }

      // Extract response from Khalti
      const khaltiResponse = await response.json();
      return NextResponse.json({
        khaltiPaymentUrl: khaltiResponse.payment_url,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid payment method. Please use 'khalti'." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error initiating payment:", error);
    return NextResponse.json(
      {
        error: "Payment initiation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
