// app/api/admin/books/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET handler to retrieve a specific book
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

    const bookId = params.id;

    // Fetch book by ID with detailed information
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}

// PUT handler to update a book
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

    const bookId = params.id;

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Parse request body (either JSON or FormData)
    let updateData: any = {};

    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      // Handle form data with possible file uploads
      const formData = await request.formData();

      // Extract basic fields
      updateData.title = formData.get("title") as string;
      updateData.author = formData.get("author") as string;
      updateData.description = (formData.get("description") as string) || null;
      updateData.isbn = (formData.get("isbn") as string) || null;
      updateData.category = (formData.get("category") as string) || null;

      const publishedYearStr =
        (formData.get("publishedYear") as string) || null;
      updateData.publishedYear = publishedYearStr
        ? parseInt(publishedYearStr)
        : null;

      // Handle file uploads
      const imageFile = (formData.get("image") as File) || null;
      const bookFile = (formData.get("bookFile") as File) || null;

      // Only update image if a new one is provided
      if (imageFile && imageFile.size > 0) {
        updateData.imageUrl = await uploadFile(imageFile, "book-covers");
      }

      // Only update book file if a new one is provided
      if (bookFile && bookFile.size > 0) {
        updateData.fileUrl = await uploadFile(bookFile, "books");
      }
    } else {
      // Handle JSON data
      const body = await request.json();

      // Set update data from JSON
      updateData = {
        title: body.title,
        author: body.author,
        description: body.description || null,
        isbn: body.isbn || null,
        category: body.category || null,
        publishedYear: body.publishedYear || null,
        // Image and file URLs can't be updated in JSON mode
      };
    }

    // Validate required fields
    if (!updateData.title || !updateData.author) {
      return NextResponse.json(
        { error: "Title and author are required" },
        { status: 400 }
      );
    }

    // Update the book
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: updateData,
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a book
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

    const bookId = params.id;

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Handle file deletion if needed
    if (existingBook.imageUrl) {
      await deleteFile(existingBook.imageUrl);
    }

    if (existingBook.fileUrl) {
      await deleteFile(existingBook.fileUrl);
    }

    // Delete the book
    await prisma.book.delete({
      where: { id: bookId },
    });

    return NextResponse.json(
      { message: "Book deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { error: "Failed to delete book" },
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
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    // Return a path to where the file would be stored
    return `/${folder}/${fileName}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("File upload failed");
  }
}

// Helper function to delete a file from storage
async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Example implementation - replace with your actual file deletion logic
    // This would typically involve your cloud storage provider's SDK

    // Extract the file path from the URL
    const filePath = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;

    // Log for demonstration (in a real implementation, you would delete the file)
    console.log(`Deleting file: ${filePath}`);

    // Return success
    return;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("File deletion failed");
  }
}
