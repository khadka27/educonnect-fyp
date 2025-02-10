import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { EventType } from ".prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const {
      title,
      date,
      location,
      type,
      contactEmail,
      contactPhone,
      startTime,
      registrationEndDate,
      description,
      bannerUrl,
      price,
      discountPercentage,
    } = data;

    // Check for missing required fields
    const requiredFields = [
      title,
      date,
      location,
      type,
      contactEmail,
      contactPhone,
      startTime,
      registrationEndDate,
    ];
    if (requiredFields.some((field) => !field)) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const eventDate = new Date(date);
    const eventStartTime = new Date(startTime);
    const eventRegistrationEndDate = new Date(registrationEndDate);

    // Check for valid date objects
    if (
      isNaN(eventDate.getTime()) ||
      isNaN(eventStartTime.getTime()) ||
      isNaN(eventRegistrationEndDate.getTime())
    ) {
      return NextResponse.json(
        { error: "Invalid date format provided" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        date: eventDate,
        startTime: eventStartTime,
        registrationEndDate: eventRegistrationEndDate,
        location,
        type: type === "PREMIUM" ? EventType.PREMIUM : EventType.FREE,
        bannerUrl: bannerUrl || null,
        contactEmail,
        contactPhone,
        price: price ? parseFloat(price) : null,
        discountPercentage: discountPercentage
          ? parseFloat(discountPercentage)
          : null,
        userId: session.user.id || "",
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

// GET: Fetch all events, sorted by date
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
