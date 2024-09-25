// /pages/api/messages/[receiverId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from "@/lib/prisma";

// GET /api/messages/:receiverId
const getMessageHistory = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { senderId, limit = 15, getAll = false, nextCursor } = req.query;
    const { receiverId } = req.query; // From the dynamic route

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Sender ID and Receiver ID are required',
      });
    }

    const limitNumber = parseInt(limit as string, 10);

    // Query options
    const queryOptions: any = {
      where: {
        OR: [
          { senderId: senderId as string, receiverId: receiverId as string },
          { senderId: receiverId as string, receiverId: senderId as string },
        ],
      },
      orderBy: { createdAt: 'desc' },
    };

    if (!getAll && nextCursor) {
      queryOptions.cursor = { createdAt: new Date(parseInt(nextCursor as string, 10)) };
      queryOptions.skip = 1;
    }

    const messages = await prisma.message.findMany({
      ...queryOptions,
      take: limitNumber,
    });

    const totalMessages = await prisma.message.count({
      where: {
        OR: [
          { senderId: senderId as string, receiverId: receiverId as string },
          { senderId: receiverId as string, receiverId: senderId as string },
        ],
      },
    });

    const nextCursorDate = messages.length === limitNumber
      ? messages[messages.length - 1].createdAt.getTime()
      : null;

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: messages,
      nextCursor: nextCursorDate,
      totalMessages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: (error as Error).message || 'Server error',
    });
  }
};

export default getMessageHistory;
