import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = params;
    const { userId } = await req.json();

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if the user has already saved this post
    const existingSave = await prisma.savedPost.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existingSave) {
      return NextResponse.json(
        { message: "Post is already saved", saved: true },
        { status: 200 }
      );
    }

    // Create a new saved post
    const savedPost = await prisma.savedPost.create({
      data: {
        postId,
        userId,
      },
    });

    // Get the updated save count
    const saveCount = await prisma.savedPost.count({
      where: { postId },
    });

    return NextResponse.json(
      {
        message: "Post saved successfully",
        savedPost,
        saveCount,
        saved: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving post:", error);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = params;
    const { userId } = await req.json();

    // Find the saved post to delete
    const savedPost = await prisma.savedPost.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (!savedPost) {
      return NextResponse.json(
        { message: "Post is not saved by this user", saved: false },
        { status: 404 }
      );
    }

    // Delete the saved post
    await prisma.savedPost.delete({
      where: {
        id: savedPost.id,
      },
    });

    // Get the updated save count
    const saveCount = await prisma.savedPost.count({
      where: { postId },
    });

    return NextResponse.json(
      {
        message: "Post unsaved successfully",
        saveCount,
        saved: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error unsaving post:", error);
    return NextResponse.json(
      { error: "Failed to unsave post" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    // Get the saved status for a specific user
    if (userId) {
      const savedPost = await prisma.savedPost.findFirst({
        where: {
          postId,
          userId,
        },
      });

      // Get the total save count for the post
      const saveCount = await prisma.savedPost.count({
        where: { postId },
      });

      return NextResponse.json(
        {
          isSaved: !!savedPost,
          saveCount,
        },
        { status: 200 }
      );
    }

    // If no userId is provided, just get the total save count
    const saveCount = await prisma.savedPost.count({
      where: { postId },
    });

    return NextResponse.json({ saveCount }, { status: 200 });
  } catch (error) {
    console.error("Error checking saved status:", error);
    return NextResponse.json(
      { error: "Failed to check saved status" },
      { status: 500 }
    );
  }
}
