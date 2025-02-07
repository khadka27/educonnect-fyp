import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { initiateEsewaPayment, initiateKhaltiPayment } from "src/lib/initiatePayments";

// Schema validation using Zod
const registrationSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
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
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isPremiumEvent = event.type === "premium";

    if (isPremiumEvent && !parsedBody.paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required for premium events" },
        { status: 400 }
      );
    }

    // Check for duplicate registration
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

    if (isPremiumEvent) {
      // Initiate payment based on the selected method
      let paymentUrl;
      if (parsedBody.paymentMethod === "esewa") {
        paymentUrl = await initiateEsewaPayment(parsedBody, event.price);
      } else if (parsedBody.paymentMethod === "khalti") {
        paymentUrl = await initiateKhaltiPayment(parsedBody, event.price);
      }

      return NextResponse.json({
        success: true,
        message: "Payment initiation successful. Redirect to payment gateway.",
        paymentUrl,
      });
    }

    // For free events, directly register the user
    const registration = await prisma.registration.create({
      data: {
        eventId: parsedBody.eventId,
        name: parsedBody.name,
        email: parsedBody.email,
        phone: parsedBody.phone,
        eventType: event.type,
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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
