import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Get all books
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const query = url.searchParams.get("q");

    // Build filter conditions
    const whereCondition: {
      category?: string;
      OR?: { title?: { contains: string; mode: "insensitive" } }[] | 
           { description?: { contains: string; mode: "insensitive" } }[] | 
           { author?: { contains: string; mode: "insensitive" } }[];
    } = {};

    if (category) {
      whereCondition.category = category;
    }

    if (query) {
      whereCondition.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { author: { contains: query, mode: "insensitive" } },
      ];
    }

    const books = await prisma.book.findMany({
      where: whereCondition,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ books });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

// Create a new book
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      author,
      description,
      imageUrl,
      fileUrl,
      isbn,
      category,
      publishedYear,
    } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: "Title and author are required" },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        imageUrl,
        fileUrl,
        isbn,
        category,
        publishedYear: publishedYear ? parseInt(publishedYear, 10) : null,
        userId: session.user?.id ?? undefined,
        
      },
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    );
  }
}
