import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name, email, phone, eventType } = await req.json();
    const registration = await prisma.registration.create({
      data: {
        name,
        email,
        phone,
        eventId: params.id,
        eventType,
      },
    });
    return NextResponse.json(registration);
  } catch (error) {
    return NextResponse.json({ error: 'Error registering for event' }, { status: 500 });
  }
}
