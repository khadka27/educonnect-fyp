// app/api/admin/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || undefined;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Prepare filters
    const filters: any = {};

    if (type && ["FREE", "PREMIUM"].includes(type)) {
      filters.type = type;
    }

    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch events with pagination
    const [events, totalEvents] = await Promise.all([
      prisma.event.findMany({
        where: filters,
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
        orderBy: {
          date: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.event.count({ where: filters }),
    ]);

    // Calculate pagination data
    const totalPages = Math.ceil(totalEvents / limit);

    return NextResponse.json({
      events,
      currentPage: page,
      totalPages,
      totalItems: totalEvents,
      itemsPerPage: limit,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "title",
      "date",
      "location",
      "type",
      "contactEmail",
      "contactPhone",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // If event type is PREMIUM, price is required
    if (
      body.type === "PREMIUM" &&
      (body.price === undefined || body.price <= 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Price is required for premium events and must be greater than 0",
        },
        { status: 400 }
      );
    }

    // Create new event
    const newEvent = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description || null,
        date: new Date(body.date),
        startTime: body.startTime ? new Date(body.startTime) : null,
        registrationEndDate: body.registrationEndDate
          ? new Date(body.registrationEndDate)
          : null,
        location: body.location,
        type: body.type,
        bannerUrl: body.bannerUrl || null,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        price: body.price || null,
        discountPercentage: body.discountPercentage || null,
        userId: session.user.id,
      },
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

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
