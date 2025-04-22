
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options"; // Import auth options

export async function GET(request: Request) {
    const url = new URL(request.url);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const limit = 10;
    const userIdParam = url.searchParams.get("userId"); // Get the userId from the query parameters
  
    try {
      const session = await getServerSession(authOptions);
      const currentUserId = session?.user?.id;
  
      const posts = await prisma.post.findMany({
        where: {
          userId: userIdParam || undefined, // Filter posts by the specified userId
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { username: true, profileImage: true }, // Include user details
          },
          comments: {
            select: {
              content: true,
              createdAt: true,
              user: {
                select: {
                  username: true,
                  profileImage: true,
                },
              },
            },
            take: 5, // Limit number of comments per post
          },
          ...(currentUserId && {
            savedBy: {
              where: { userId: currentUserId },
              select: { id: true },
            },
          }),
        },
      });
  
      const totalPosts = await prisma.post.count({
        where: {
          userId: userIdParam || undefined, // Count only the specified user's posts
        },
      });
      const hasMore = page * limit < totalPosts;
  
      const postsWithSaveStatus = posts.map(post => ({
        ...post,
        isSaved: post.savedBy?.length > 0, // Check if post is saved by the current user
      }));
  
      return NextResponse.json({
        posts: postsWithSaveStatus,
        hasMore,
      });
    } catch (error) {
      console.error("Error fetching posts:", (error as Error).message);
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }
  }
