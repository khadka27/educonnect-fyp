"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transactionId = searchParams.get("transaction_id");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="mb-4">
        Thank you for your payment. Your transaction ID is:{" "}
        <span className="font-mono">{transactionId}</span>
      </p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => router.push("/Events")}
      >
        Go to Events
      </button>
    </div>
  );
}
