import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { EventType, PaymentStatus } from ".prisma/client";
import {
  initiateEsewaPayment,
  initiateKhaltiPayment,
} from "src/lib/initiatePayments";

// Schema for validating registration input
const registrationSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  paymentMethod: z.enum(["esewa", "khalti"]).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedBody = registrationSchema.parse(body);

    // Ensure the event exists
    const event = await prisma.event.findUnique({
      where: { id: parsedBody.eventId },
    });
    if (!event) {
      return NextResponse.json(
        { error: "Event not found or invalid ID" },
        { status: 404 }
      );
    }

    // Prevent duplicate registration (by eventId and email)
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        eventId: parsedBody.eventId,
        email: parsedBody.email,
      },
    });
    if (existingRegistration) {
      return NextResponse.json(
        { error: "You have already registered for this event" },
        { status: 400 }
      );
    }

    const isPremiumEvent = event.type === EventType.PREMIUM;

    // For premium events, ensure a payment method is provided
    if (isPremiumEvent && !parsedBody.paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required for premium events" },
        { status: 400 }
      );
    }

    // Create a registration record.
    // For premium events, set paymentStatus as PENDING.
    const registration = await prisma.registration.create({
      data: {
        eventId: parsedBody.eventId,
        name: parsedBody.name,
        email: parsedBody.email,
        phone: parsedBody.phone,
        eventType: event.type,
        paymentStatus: isPremiumEvent ? PaymentStatus.PENDING : null,
        transactionId: null,
      },
    });

    // If premium, initiate payment and return payment URL
    if (isPremiumEvent) {
      let paymentUrl: string | undefined;
      if (parsedBody.paymentMethod === "esewa") {
        if (event.price !== null) {
          // Pass registration.id so it can be linked later on payment success
          paymentUrl = await initiateEsewaPayment(
            parsedBody,
            event.price,
            registration.id
          );
        } else {
          return NextResponse.json(
            { error: "Event price is not set" },
            { status: 400 }
          );
        }
      } else if (parsedBody.paymentMethod === "khalti") {
        if (event.price !== null) {
          paymentUrl = await initiateKhaltiPayment(
            parsedBody,
            event.price,
            registration.id
          );
        } else {
          return NextResponse.json(
            { error: "Event price is not set" },
            { status: 400 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        message:
          "Registration created and payment initiation successful. Redirect to payment gateway.",
        paymentUrl,
        registration,
      });
    }

    // For free events, registration is complete
    return NextResponse.json(
      { success: true, message: "Registration successful.", registration },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
