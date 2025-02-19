import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pidx } = await req.json();
    if (!pidx) {
      return NextResponse.json({ error: "Missing pidx" }, { status: 400 });
    }

    // Khalti's Lookup API for verifying transaction
    const lookupRes = await fetch(
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

    if (!lookupRes.ok) {
      const errorData = await lookupRes.json();
      console.error("Khalti Lookup Error:", errorData);
      return NextResponse.json(
        { error: "Khalti lookup failed", details: errorData },
        { status: 500 }
      );
    }

    const data = await lookupRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in Khalti Lookup:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Server error", details: errorMessage },
      { status: 500 }
    );
  }
}
