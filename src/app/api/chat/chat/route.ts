import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma'; // Ensure you have Prisma client instance set up

export async function POST(req: Request) {
    const { senderId, receiverId, content, groupId } = await req.json();

    // Direct message
    const message = await prisma.message.create({
        data: {
            content,
            senderId,
            receiverId,
            groupId, // For group messages, if applicable
        },
    });

    return NextResponse.json(message);
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId'); // Retrieve messages for a specific user

    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId }, 
                { receiverId: userId }
            ]
        },
        include: {
            sender: true,
            receiver: true,
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    return NextResponse.json(messages);
}
