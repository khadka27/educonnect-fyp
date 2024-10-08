import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const eventId = searchParams.get("eventId");
  const userId = searchParams.get("userId");

  if (!eventId || !userId) {
    return NextResponse.json(
      { error: "Missing eventId or userId" },
      { status: 400 }
    );
  }

  try {
    // Find a registration where the related event's userId matches
    const registration = await prisma.registration.findFirst({
      where: {
        eventId: eventId,
        event: {
          userId: userId,
        },
      },
    });

    return NextResponse.json({ isRegistered: !!registration });
  } catch (error) {
    console.error("Error checking registration:", error);
    return NextResponse.json(
      { error: "Failed to check registration" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
