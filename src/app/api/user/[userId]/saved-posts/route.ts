import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all saved posts for a specific user
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Fetch saved posts for the user
    const savedPosts = await prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            user: {
              select: { username: true, profileImage: true },
            },
          },
        },
      },
    });

    // Map the saved posts to include necessary details
    const formattedPosts = savedPosts.map((savedPost) => ({
      id: savedPost.post.id,
      content: savedPost.post.content,
      createdAt: savedPost.post.createdAt,
      postUrl: savedPost.post.postUrl,
      user: savedPost.post.user,
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved posts" },
      { status: 500 }
    );
  }
}
