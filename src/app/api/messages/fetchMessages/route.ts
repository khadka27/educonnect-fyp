// app/api/messages/fetchMessages/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const senderId = searchParams.get('senderId');
  const receiverId = searchParams.get('receiverId');

  // Validate the input parameters
  if (!senderId || !receiverId) {
    return NextResponse.json({ error: 'Missing senderId or receiverId' }, { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Error fetching messages.' }, { status: 500 });
  }
}
