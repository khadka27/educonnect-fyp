"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Processing payment...");

  useEffect(() => {
    // Extract parameters from the URL
    const pidx = searchParams.get("pidx");
    const transactionId = searchParams.get("transaction_id");
    const amount = searchParams.get("amount");
    const status = searchParams.get("status");

    // Check if required params exist
    if (!pidx || !transactionId || !amount || !status) {
      setStatusMessage("❌ Missing required parameters in the URL.");
      setLoading(false);
      return;
    }

    // If status isn't completed, we consider the payment unsuccessful
    if (status !== "Completed") {
      setStatusMessage("❌ Payment not completed.");
      setLoading(false);
      return;
    }

    // (A) Payment looks successful from the URL,
    //     but we can do an optional step: verify with Khalti’s lookup API.
    verifyKhaltiPayment(pidx)
      .then((lookupData) => {
        if (lookupData.status === "Completed") {
          setStatusMessage("✅ Payment Successful! Thank you.");
        } else {
          setStatusMessage("❌ Payment not verified by Khalti.");
        }
      })
      .catch((err) => {
        console.error("Error verifying payment:", err);
        setStatusMessage("❌ Payment verification failed.");
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  async function verifyKhaltiPayment(pidx: string) {
    const response = await fetch("/api/khalti-lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pidx }),
    });
    if (!response.ok) {
      throw new Error("Failed to lookup payment");
    }
    return await response.json();
  }

  if (loading) {
    return <div className="p-4">Validating payment...</div>;
  }

  return (
    <div className="p-4">
      <h1>Payment Status</h1>
      <p>{statusMessage}</p>
      <button onClick={() => router.push("/Events")}>Go to Events</button>
    </div>
  );
}
