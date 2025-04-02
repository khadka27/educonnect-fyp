// app/api/admin/events/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET handler to retrieve a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const eventId = params.id;

    // Fetch event by ID with detailed information
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        registrations: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            event: {
              select: {
                title: true,
                type: true,
              },
            },
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            registrations: true,
            payments: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PUT handler to update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const eventId = params.id;
    const body = await request.json();

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    const requiredFields = ['title', 'date', 'location', 'type', 'contactEmail', 'contactPhone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // If event type is PREMIUM, price is required
    if (body.type === 'PREMIUM' && (body.price === undefined || body.price <= 0)) {
      return NextResponse.json(
        { error: "Price is required for premium events and must be greater than 0" },
        { status: 400 }
      );
    }

    // Prepare update data with proper date handling
    const updateData = {
      title: body.title,
      description: body.description || null,
      date: new Date(body.date),
      startTime: body.startTime ? new Date(body.startTime) : null,
      registrationEndDate: body.registrationEndDate ? new Date(body.registrationEndDate) : null,
      location: body.location,
      type: body.type,
      bannerUrl: body.bannerUrl || null,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      price: body.type === 'PREMIUM' ? body.price : null,
      discountPercentage: body.discountPercentage || null,
    };

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            payments: true,
          },
        },
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE handler to remove an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const eventId = params.id;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            registrations: true,
            payments: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Optional: Add warning for events with registrations/payments
    if (existingEvent._count.registrations > 0 || existingEvent._count.payments > 0) {
      // You might want to return a warning, implement soft delete, 
      // or handle this case differently in a production environment
      console.warn(`Deleting event with ${existingEvent._count.registrations} registrations and ${existingEvent._count.payments} payments`);
    }

    // Delete event (will cascade delete registrations and payments according to schema)
    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}

// GET handler for event registrations
export async function GET_REGISTRATIONS(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const eventId = params.id;
    
    // Parse query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Fetch registrations with pagination
    const [registrations, totalRegistrations] = await Promise.all([
      prisma.registration.findMany({
        where: { eventId },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.registration.count({ where: { eventId } }),
    ]);

    // Calculate pagination data
    const totalPages = Math.ceil(totalRegistrations / limit);

    return NextResponse.json({
      registrations,
      currentPage: page,
      totalPages,
      totalItems: totalRegistrations,
      itemsPerPage: limit,
    });
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch event registrations" },
      { status: 500 }
    );
  }
}