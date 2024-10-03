import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Create a new event
export async function POST(req: Request) {
  try {
    // Parse incoming request data
    const data = await req.json();
    
    // Destructure required fields from the request body
    const {
      title,
      date,
      location,
      type,
      contactEmail,
      contactPhone,
      startTime,
      registrationEndDate,
      description,  // Optional field
      bannerUrl,    // Optional field
      price,        // Optional field
      discountPercentage, // Optional field
    } = data;

    // Validate required fields
    if (
      !title ||
      !date ||
      !location ||
      !type ||
      !contactEmail ||
      !contactPhone ||
      !startTime ||
      !registrationEndDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure date and time fields are properly converted to Date objects
    const eventDate = new Date(date);
    const eventStartTime = new Date(startTime);
    const eventRegistrationEndDate = new Date(registrationEndDate);

    // Create the new event using Prisma
    const event = await prisma.event.create({
      data: {
        title,
        description: description || null, // Optional field
        date: eventDate,  // Ensure date is in Date format
        startTime: eventStartTime,  // Ensure startTime is in Date format
        registrationEndDate: eventRegistrationEndDate,  // Ensure registrationEndDate is in Date format
        location,
        type,
        bannerUrl: bannerUrl || null, // Optional field
        contactEmail,
        contactPhone,
        price: price || 0, // Optional, default to 0 if not provided
        discountPercentage: discountPercentage || 0, // Optional, default to 0 if not provided
      },
    });

    // Return the created event with a 201 status code
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
    // Retrieve events from the database, sorted by date (ascending)
    const events = await prisma.event.findMany({
      orderBy: {
        date: "asc", // Sorting events by the date in ascending order
      },
    });

    // Return the list of events
    return NextResponse.json({ events });
    
  } catch (error) {
    console.error("Error fetching events:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
