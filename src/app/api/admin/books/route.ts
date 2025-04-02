// app/api/admin/books/route.ts
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
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || undefined;
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Prepare filters
    const filters: any = {};
    
    if (category && category !== "ALL") {
      filters.category = category;
    }
    
    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { isbn: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch books with pagination
    const [books, totalBooks] = await Promise.all([
      prisma.book.findMany({
        where: filters,
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.book.count({ where: filters }),
    ]);

    // Calculate pagination data
    const totalPages = Math.ceil(totalBooks / limit);

    return NextResponse.json({
      books,
      currentPage: page,
      totalPages,
      totalItems: totalBooks,
      itemsPerPage: limit,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
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
    const formData = await request.formData();
    
    // Extract basic fields
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string || null;
    const isbn = formData.get("isbn") as string || null;
    const category = formData.get("category") as string || null;
    const publishedYearStr = formData.get("publishedYear") as string || null;
    
    // Parse published year (if provided)
    const publishedYear = publishedYearStr ? parseInt(publishedYearStr) : null;
    
    // Validate required fields
    if (!title || !author) {
      return NextResponse.json(
        { error: "Title and author are required" },
        { status: 400 }
      );
    }

    // Handle file uploads
    const imageFile = formData.get("image") as File || null;
    const bookFile = formData.get("bookFile") as File || null;
    
    // Process files and get URLs (with your file upload handling)
    const imageUrl = imageFile ? await uploadFile(imageFile, "book-covers") : null;
    const fileUrl = bookFile ? await uploadFile(bookFile, "books") : null;

    // Create new book
    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        description,
        isbn,
        category,
        publishedYear,
        imageUrl,
        fileUrl,
        userId: session.user.id, // Set the logged-in admin as creator
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    );
  }
}

// Helper function for file upload (implement with your preferred storage solution)
async function uploadFile(file: File, folder: string): Promise<string> {
  try {
    // Example implementation - replace with your actual file storage logic
    // This could be AWS S3, Cloudinary, or your own server storage
    
    // For demonstration, we'll create a mock URL based on file name
    // In a real implementation, you would upload to a storage service and get the URL
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Return a path to where the file would be stored
    return `/${folder}/${fileName}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("File upload failed");
  }
}