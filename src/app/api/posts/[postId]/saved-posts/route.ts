import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options"; // Ensure path is correct
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.id) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const postId = params.postId; // Extract postId from params
    const userId = session.user.id;

    if (!postId || typeof postId !== "string") {
      return new NextResponse("Invalid or missing postId", { status: 400 });
    }

    // Check if the post is already saved by the user
    const existingSave = await prisma.savedPost.findFirst({
      where: { postId, userId },
    });

    if (existingSave) {
      // Return an appropriate message if the post is already saved
      return new NextResponse(JSON.stringify({ error: "Post already saved" }), {
        status: 400,
      });
    }

    // Save the post
    await prisma.savedPost.create({
      data: {
        postId,
        userId, // Ensure userId is always defined
      },
    });

    return new NextResponse(
      JSON.stringify({ message: "Post saved successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving post:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
