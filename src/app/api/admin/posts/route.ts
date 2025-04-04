// app/api/admin/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Fetch all posts with pagination and filters
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
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const userId = searchParams.get("userId") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const orderBy = searchParams.get("orderBy") || "desc";
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Prepare filters
    const where: any = {};
    
    if (search) {
      where.content = { contains: search, mode: "insensitive" };
    }

    if (userId) {
      where.userId = userId;
    }

    // Prepare sorting
    const order: any = {};
    order[sortBy] = orderBy;

    // Fetch posts with pagination, including related data
    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              profileImage: true,
            },
          },
          _count: {
            select: {
              reactions: true,
              comments: true,
            },
          },
        },
        orderBy: order,
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    // Calculate pagination data
    const totalPages = Math.ceil(totalPosts / limit);

    return NextResponse.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalPosts,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST: Create a new post (admin can create posts on behalf of users)
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
    const { content, postUrl, userId } = body;

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // If specific userId is provided, verify user exists
    if (userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        return NextResponse.json(
          { error: "The specified user does not exist" },
          { status: 400 }
        );
      }
    }

    // Determine which userId to use (specified or admin's own id)
    const authorId = userId || session.user.id;

    // Create new post
    const post = await prisma.post.create({
      data: {
        content,
        postUrl: postUrl || null,
        userId: authorId,
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

// DELETE: Bulk delete posts (for admin moderation)
export async function DELETE(request: NextRequest) {
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
    const { postIds } = body;

    // Validate postIds
    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: "Please provide a valid array of post IDs" },
        { status: 400 }
      );
    }

    // Delete posts
    const { count } = await prisma.post.deleteMany({
      where: {
        id: { in: postIds },
      },
    });

    return NextResponse.json({
      message: `Successfully deleted ${count} posts`,
      deletedCount: count,
    });
  } catch (error) {
    console.error("Error deleting posts:", error);
    return NextResponse.json(
      { error: "Failed to delete posts" },
      { status: 500 }
    );
  }
}