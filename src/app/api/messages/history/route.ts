// src/app/api/messages/history/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import based on your prisma setup
import { getSession } from "next-auth/react"; // For user authentication

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const senderId = searchParams.get("senderId");
//   const receiverId = searchParams.get("receiverId");

//   // Validate the required fields
//   if (!senderId || !receiverId) {
//     return NextResponse.json(
//       { success: false, message: "Sender ID and Receiver ID are required." },
//       { status: 400 }
//     );
//   }

//   try {
//     const messages = await prisma.message.findMany({
//       where: {
//         OR: [
//           { senderId: senderId, receiverId: receiverId },
//           { senderId: receiverId, receiverId: senderId },
//         ],
//       },
//       orderBy: {
//         createdAt: "asc",
//       },
//     });

//     return NextResponse.json({ success: true, data: messages }, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ success: false, message: "Failed to fetch messages." }, { status: 500 });
//   }
// }


// GET /api/message/history?receiverId=<userId>
export async function GET(req: Request) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const receiverId = searchParams.get("receiverId");

  if (!receiverId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId },
        { senderId: receiverId, receiverId: session.user.id },
      ],
      expiresAt: {
        gt: new Date(), // Filter expired messages
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ success: true, data: messages });
}