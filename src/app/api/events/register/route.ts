import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { eventId, userId, name, email, eventType, paymentStatus, transactionId } = await req.json();

  if (!eventId || !userId || !name || !email || !eventType) {
    return NextResponse.json(
      { error: "Invalid registration data" },
      { status: 400 }
    );
  }

  try {
    // Check if user is already registered for the event
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        eventId,
        email, // Ensuring the user has not already registered
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "User already registered for this event" },
        { status: 400 }
      );
    }

    // Create a new registration entry in the database
    const registration = await prisma.registration.create({
      data: {
        eventId,
        name,
        email,
        phone: "", // You can add phone in future implementations
        eventType, // free or premium
        paymentStatus: eventType === "premium" ? paymentStatus : null, // Handle payment for premium events
        transactionId: eventType === "premium" ? transactionId : null, // Store transaction details for premium events
      },
    });

    return NextResponse.json({
      message: "Registration successful",
      registration,
    });
  } catch (error) {
    console.log("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500 }
    );
  }
}
