import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId, type } = await req.json();

    // Validate input
    if (!userId || !type) {
      return new Response("Missing userId or reaction type", { status: 400 });
    }

    // Validate reaction type
    const allowedReactionTypes = ["like", "love", "wow"];
    if (!allowedReactionTypes.includes(type)) {
      return new Response("Invalid reaction type", { status: 400 });
    }

    // Check if the reaction already exists
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        postId_userId_type: {
          postId: params.postId,
          userId,
          type,
        },
      },
    });

    if (existingReaction) {
      // If the reaction exists, remove it (unlike)
      await prisma.reaction.delete({
        where: {
          id: existingReaction.id,
        },
      });
      return new Response(JSON.stringify({ message: "Reaction removed" }), {
        status: 200,
      });
    }

    // If no reaction exists, create a new one
    const newReaction = await prisma.reaction.create({
      data: {
        type,
        user: { connect: { id: userId } },
        post: { connect: { id: params.postId } },
      },
    });

    return new Response(JSON.stringify(newReaction), { status: 200 });
  } catch (error) {
    if (error instanceof Error && (error as any).code === "P2002") {
      // Unique constraint error
      return new Response("You have already reacted with this type", {
        status: 400,
      });
    }
    console.error("Error creating reaction:", error); // Log the error for debugging
    return new Response("Error creating reaction", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  if (!params?.postId) {
    return new Response("Missing postId", { status: 400 });
  }

  try {
    const reaction = await prisma.reaction.findFirst({
      where: {
        postId: params.postId,
        userId,
        type: "like",
      },
    });

    return new Response(JSON.stringify({ isLiked: !!reaction }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching like status:", error);
    return new Response("Error fetching like status", { status: 500 });
  }
}
