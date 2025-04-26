import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const { userId, type } = await req.json();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if the user has already liked this post
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        postId,
        userId,
        type,
      },
    });

    if (existingReaction) {
      // If the user has already liked the post, unlike it (delete the reaction)
      await prisma.reaction.delete({
        where: {
          id: existingReaction.id,
        },
      });

      // Get updated like count for the post
      const likeCount = await prisma.reaction.count({
        where: {
          postId,
          type: "like",
        },
      });

      return NextResponse.json({
        message: "Post unliked successfully",
        liked: false,
        likeCount,
      });
    } else {
      // Otherwise, create a new reaction (like)
      const reaction = await prisma.reaction.create({
        data: {
          postId,
          userId,
          type,
        },
      });

      // Get updated like count for the post
      const likeCount = await prisma.reaction.count({
        where: {
          postId,
          type: "like",
        },
      });

      return NextResponse.json({
        message: "Post liked successfully",
        liked: true,
        reaction,
        likeCount,
      });
    }
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    return NextResponse.json(
      { error: "Failed to like/unlike post" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { readonly params: { readonly postId: string } }
) {
  try {
    // Extract and store postId right away
    const postId = params.postId;
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response("Missing userId", { status: 400 });
    }

    if (!postId) {
      return new Response("Missing postId", { status: 400 });
    }

    // Get the specific user's like status for this post
    const reaction = await prisma.reaction.findFirst({
      where: {
        postId,
        userId,
        type: "like",
      },
    });

    // Get the total like count for the post
    const likeCount = await prisma.reaction.count({
      where: {
        postId,
        type: "like",
      },
    });

    return new Response(
      JSON.stringify({
        isLiked: !!reaction,
        likeCount,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching like status:", error);
    return new Response("Error fetching like status", { status: 500 });
  }
}
