import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all books
export async function GET() {
  try {
    const books = await prisma.book.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json({ books }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

// Create a new book
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is a teacher
    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only teachers can add books" }, { status: 403 });
    }
    
    const body = await request.json();
    const { title, author, description, imageUrl, fileUrl, isbn, category, publishedYear } = body;
    
    if (!title || !author) {
      return NextResponse.json({ error: "Title and author are required" }, { status: 400 });
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
        publishedYear,
        userId: session.user.id,
      },
    });
    
    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}