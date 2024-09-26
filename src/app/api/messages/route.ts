import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming you have a prisma client setup
import { getSession } from "next-auth/react"; // For user authentication

// POST /api/message/send
export async function POST(req: Request) {
  const session = await getSession(); // Authentication check
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId, content, fileUrl, fileType } = await req.json();

  if (!receiverId || !content) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.user?.id as string,
      receiverId,
      content,
      fileUrl,
      fileType,
    },
  });

  return NextResponse.json({ success: true, message });
}


