import { prisma } from "@/lib/prisma"; // Assuming you have prisma instance

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId, type } = await req.json();

    if (!userId || !type) {
      return new Response("Missing userId or reaction type", { status: 400 });
    }

    // Connect the reaction to an existing post
    const reaction = await prisma.reaction.create({
      data: {
        type,
        user: { connect: { id: userId } }, // Ensure you're connecting the user
        post: { connect: { id: params.postId } }, // Connect to the post
      },
    });

    return new Response(JSON.stringify(reaction), { status: 200 });
  } catch (error) {
    console.error("Error creating reaction:", error);
    return new Response("Error creating reaction", { status: 500 });
  }
}
