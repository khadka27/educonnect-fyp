// src/app/api/events/register/route.ts

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Define schema using Zod for validation
const registrationSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15),
});

export async function POST(req: Request) {
  try {
    // 1. Parse and Validate Request Body
    const body = await req.json();
    const { eventId, name, email, phone } = registrationSchema.parse(body);

    // 2. Fetch Event to Determine Event Type
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const eventType = event.type; // 'free' or 'premium'

    // 3. Re-validate Required Fields Based on Event Type
    if (eventType === 'premium') {
      const { paymentStatus, transactionId } = body;

      if (!paymentStatus || !transactionId) {
        return NextResponse.json(
          { error: 'Payment details are required for premium events' },
          { status: 400 }
        );
      }

      // Optionally, validate paymentStatus values
      const validPaymentStatuses = ['pending', 'completed', 'failed'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          { error: 'Invalid payment status' },
          { status: 400 }
        );
      }
    }

    // 4. Check if User is Already Registered for the Event
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        eventId,
        email,
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You have already registered for this event' },
        { status: 400 }
      );
    }

    // 5. Create a New Registration in the Database
    const registration = await prisma.registration.create({
      data: {
        eventId,
        name,
        email,
        phone: phone || '',
        eventType, // 'free' or 'premium'
        paymentStatus: eventType === 'premium' ? body.paymentStatus : null,
        transactionId: eventType === 'premium' ? body.transactionId : null,
      },
    });

    // 6. Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    // 7. Generate a Simple Ticket
    const ticket = `
      Event Ticket
      ------------
      Event ID: ${eventId}
      Name: ${name}
      Registration ID: ${registration.id}
      Date: ${new Date().toLocaleDateString()}
    `;

    // 8. Conditional Email Sending
    if (eventType === 'free') {
      // Send Confirmation Email for Free Events
      await transporter.sendMail({
        from: process.env.EMAIL_FROM, // Ensure this email is verified and allowed by your SMTP provider
        to: email,
        subject: 'Event Registration Confirmation',
        text: `
          Thank you for registering for our event!

          ${ticket}

          We look forward to seeing you at the event.
        `,
        html: `
          <p>Thank you for registering for our event!</p>
          <pre>${ticket}</pre>
          <p>We look forward to seeing you at the event.</p>
        `,
      });

      return NextResponse.json({
        success: true,
        message: 'Registration successful and confirmation email sent.',
        registration,
      }, { status: 201 });
    } else if (eventType === 'premium') {
      // Handle Premium Event Registration (e.g., Redirect to Payment Gateway)
      // You might want to integrate Stripe or another payment provider here
      // For now, we'll assume payment is handled elsewhere

      // Optionally, send an email with payment instructions
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Premium Event Registration - Payment Required',
        text: `
          Thank you for registering for our premium event!

          Please complete your payment to confirm your registration.

          Payment Details:
          Transaction ID: ${registration.transactionId}

          ${ticket}

          We look forward to seeing you at the event.
        `,
        html: `
          <p>Thank you for registering for our premium event!</p>
          <p>Please complete your payment to confirm your registration.</p>
          <p><strong>Payment Details:</strong></p>
          <p>Transaction ID: ${registration.transactionId}</p>
          <pre>${ticket}</pre>
          <p>We look forward to seeing you at the event.</p>
        `,
      });

      return NextResponse.json({
        success: true,
        message: 'Registration successful. Please complete your payment to confirm.',
        registration,
      }, { status: 201 });
    } else {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration and Email Error:', error);
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}
