import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const transactionId = url.searchParams.get("transactionId");

  if (!transactionId) {
    return NextResponse.json({ error: "Invalid transaction" }, { status: 400 });
  }

  await prisma.payment.update({
    where: { transactionId },
    data: { status: "failed", failureReason: "Payment failed" },
  });

  return NextResponse.json({ message: "Payment failed" });
}
