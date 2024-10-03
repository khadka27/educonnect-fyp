
import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: 'asc', // Sorting events by date
      },
    });
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  const data = await req.json();

  try {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        location: data.location,
        type: data.type,
        bannerUrl: data.bannerUrl || null,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
      },
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

