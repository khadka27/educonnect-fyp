"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [statusMessage, setStatusMessage] = useState("Processing payment...");

  useEffect(() => {
    const pidx = searchParams.get("pidx");
    const transactionId = searchParams.get("transaction_id");
    const amount = searchParams.get("amount");
    const status = searchParams.get("status");

    if (!pidx || !transactionId || !amount || !status) {
      setStatusMessage("Missing required payment parameters.");
      return;
    }

    if (status !== "Completed") {
      setStatusMessage("Payment was not completed successfully.");
      return;
    }

    setStatusMessage("Payment Successful! Thank you for your payment.");
  }, [searchParams]);

  return (
    <div className="p-8">
      <h1>Payment Status</h1>
      <p>{statusMessage}</p>
      <button onClick={() => router.push("/events")}>Go to Events</button>
    </div>
  );
}
