// src/app/api/register/route.ts

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      eventId,
      // userId,
      name,
      email,
      phone,
      eventType, // 'free' or 'premium'
      paymentStatus, // required if 'premium'
      transactionId, // required if 'premium'
    } = body;

    // 1. Validate Required Fields
    if (
      !eventId ||
      // !userId ||
      !name ||
      !email ||
      !eventType ||
      (eventType === 'premium' && (!paymentStatus || !transactionId))
    ) {
      return NextResponse.json(
        { error: 'Invalid registration data' },
        { status: 400 }
      );
    }

    // 2. Check if User is Already Registered for the Event
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        eventId,
        email,
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'User already registered for this event' },
        { status: 400 }
      );
    }

    // 3. Create a New Registration in the Database
    const registration = await prisma.registration.create({
      data: {
        eventId,
        // userId,
        name,
        email,
        phone: phone || '', // Optional: Provide default empty string if phone is not provided
        eventType, // 'free' or 'premium'
        paymentStatus: eventType === 'premium' ? paymentStatus : null,
        transactionId: eventType === 'premium' ? transactionId : null,
      },
    });

    // 4. Generate a Simple Ticket
    const ticket = `
      Event Ticket
      ------------
      Event ID: ${eventId}
      Name: ${name}
      Registration ID: ${registration.id}
      Date: ${new Date().toLocaleDateString()}
    `;

    // 5. Send Confirmation Email
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

    // 6. Return Success Response
    return NextResponse.json({
      success: true,
      message: 'Registration successful and confirmation email sent.',
      registration,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration and Email Error:', error);
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}
