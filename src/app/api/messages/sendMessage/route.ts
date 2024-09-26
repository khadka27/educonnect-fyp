import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { content, senderId, receiverId, fileUrl, fileType } = await request.json();

    // Check for missing fields
    if (!content || !senderId || !receiverId) {
      return NextResponse.json({ error: 'Missing required fields: content, senderId, receiverId' }, { status: 400 });
    }

    // Check if sender and receiver exist
    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });

    if (!sender || !receiver) {
      return NextResponse.json({ error: 'Invalid sender or receiver ID' }, { status: 400 });
    }

    // Save the message in the database
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        fileUrl,
        fileType,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Set expiry to 24 hours
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json({ error: 'Error saving message' }, { status: 500 });
  }
}
