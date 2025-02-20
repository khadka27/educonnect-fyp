import { generateEsewaSignature } from "@/lib/generateEsewaSignature";

export async function initiateEsewaPayment(
  registrationData: any,
  amount: number,
  id: string
) {
  const transactionUuid = `${Date.now()}-${registrationData.transactionId}`;
  const esewaConfig = {
    amount: amount.toString(),
    transaction_uuid: transactionUuid,
    product_code: process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE,
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
    failure_url: `${process.env.NEXT_PUBLIC_BASE_URL}/failure`,
  };

  const signatureString = `amount=${esewaConfig.amount},transaction_uuid=${esewaConfig.transaction_uuid},product_code=${esewaConfig.product_code}`;
  const signature = generateEsewaSignature(
    process.env.NEXT_PUBLIC_ESEWA_SECRET_KEY!,
    signatureString
  );

  return `https://epay.esewa.com.np/epay/main?amt=${esewaConfig.amount}&pid=${transactionUuid}&scd=${esewaConfig.product_code}&su=${esewaConfig.success_url}&fu=${esewaConfig.failure_url}&sig=${signature}`;
}

export async function initiateKhaltiPayment(
  registrationData: any,
  amount: number
) {
  const khaltiConfig = {
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
    amount: Math.round(amount * 100), // Khalti expects the amount in paisa
    purchase_order_id: registrationData.transactionId,
    purchase_order_name: "Event Registration",
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

  const paymentData = await response.json();
  return paymentData.payment_url;
}
