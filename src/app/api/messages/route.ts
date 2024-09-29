import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSocket } from '@/utils/socketio'
import { authOptions } from '../auth/[...nextauth]/options'
import { getServerSession } from 'next-auth/next'


const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const senderId = searchParams.get('senderId')
  const receiverId = searchParams.get('receiverId')
  const groupId = searchParams.get('groupId')

  if (!senderId || (!receiverId && !groupId)) {
    return NextResponse.json({ success: false, message: 'Missing required parameters' }, { status: 400 })
  }

  try {
    let messages
    if (groupId) {
      messages = await prisma.message.findMany({
        where: {
          groupId: groupId
        },
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          }
        }
      })
    } else {
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: senderId as string, receiverId: receiverId as string },
            { senderId: receiverId as string, receiverId: senderId as string }
          ]
        },
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          }
        }
      })
    }
    return NextResponse.json({ success: true, data: messages })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error fetching messages' }, { status: 500 })
  }
}

// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions)

//   if (!session) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   const { content, chatId } = await req.json()

//   try {
//     const message = await prisma.message.create({
//       data: {
//         content,
//         senderId: session.user.id,
//         receiverId:
//         chatId,
//       },
//       include: {
//         sender: true,
//       },
//     })

//     return NextResponse.json(message)
//   } catch (error) {
//     console.error('Error creating message:', error)
//     return NextResponse.json({ error: 'Error creating message' }, { status: 500 })
//   }
// }



export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { content, chatId, receiverId } = await req.json(); // Make sure receiverId is passed in the request

  try {
    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId: receiverId, // Use receiverId from the request body
        chatId: chatId, // Assuming chatId is a foreign key for chat context
      },
      include: {
        sender: true,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Error creating message' }, { status: 500 });
  }
}
