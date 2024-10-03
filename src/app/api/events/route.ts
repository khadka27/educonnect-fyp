import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: 'asc', // Sorting events by date
      },
    });
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validating required fields
    const { title, date, location, type, contactEmail, contactPhone, startTime, registrationEndDate } = data;
    
    if (!title || !date || !location || !type || !contactEmail || !contactPhone || !startTime || !registrationEndDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Creating the event
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description || null,
        date: new Date(data.date),
        startTime: new Date(data.startTime), // Ensure startTime is handled correctly
        registrationEndDate: new Date(data.registrationEndDate), // Handle registration end date
        location: data.location,
        type: data.type,
        bannerUrl: data.bannerUrl || null, // Optional field
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        price: data.price || 0, // Optional field for price, default to 0 if not provided
        discountPercentage: data.discountPercentage || 0, // Optional field for discount percentage, default to 0
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
