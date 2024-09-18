import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, postId } = await req.json();

    if (!userId || !postId) {
      return new Response("Missing userId or postId", { status: 400 });
    }

    const savedPost = await prisma.savedPost.create({
      data: {
        user: { connect: { id: userId } },
        post: { connect: { id: postId } },
      },
    });

    return new Response(JSON.stringify(savedPost), { status: 200 });
  } catch (error) {
    return new Response("Error saving post", { status: 500 });
  }
}
