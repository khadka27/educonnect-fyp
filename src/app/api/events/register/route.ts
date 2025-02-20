import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  initiateEsewaPayment,
  initiateKhaltiPayment,
} from "src/lib/initiatePayments";
import { EventType } from ".prisma/client";

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
    // Parse and validate input
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

    // Determine if this is a premium event
    const isPremiumEvent = event.type === EventType.PREMIUM;

    // For premium events, a payment method must be provided
    if (isPremiumEvent && !parsedBody.paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required for premium events" },
        { status: 400 }
      );
    }

    // Prevent duplicate registration (by checking eventId and email)
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

    // If the event is premium, initiate payment before registration
    if (isPremiumEvent) {
      let paymentUrl: string | undefined;
      if (parsedBody.paymentMethod === "esewa") {
        if (event.price !== null) {
          paymentUrl = await initiateEsewaPayment(parsedBody, event.price);
        } else {
          return NextResponse.json(
            { error: "Event price is not set" },
            { status: 400 }
          );
        }
      } else if (parsedBody.paymentMethod === "khalti") {
        if (event.price !== null) {
          paymentUrl = await initiateKhaltiPayment(parsedBody, event.price);
        } else {
          return NextResponse.json(
            { error: "Event price is not set" },
            { status: 400 }
          );
        }
      }
      return NextResponse.json({
        success: true,
        message: "Payment initiation successful. Redirect to payment gateway.",
        paymentUrl,
      });
    }

    // For free events, register the user directly
    const registration = await prisma.registration.create({
      data: {
        eventId: parsedBody.eventId,
        name: parsedBody.name,
        email: parsedBody.email,
        phone: parsedBody.phone,
        eventType: event.type, // FREE in this case
      },
    });

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
