// app/api/socket/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import {prisma} from '@/lib/prisma'; // Adjust the import based on your directory structure

type NextApiResponseSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponseSocket) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io...');

    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Fetch chat history when user connects
      socket.on('joinChat', async (userId) => {
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { senderId: userId },
              { receiverId: userId },
            ],
          },
          orderBy: {
            createdAt: 'asc',
          },
        });

        socket.emit('chatHistory', messages); // Send chat history to the client
      });

      // Handle incoming messages
      socket.on('message', async (data) => {
        const { content, senderId, receiverId } = data;

        // Save the message to the database
        const message = await prisma.message.create({
          data: {
            content,
            senderId,
            receiverId,
          },
        });

        // Emit the message to the receiver
        socket.to(receiverId).emit('message', message); // Send the saved message object
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
