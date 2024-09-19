// import { prisma } from "@/lib/prisma";

// export async function POST(
//   req: Request,
//   { params }: { params: { postId: string } }
// ) {
//   try {
//     const { userId } = await req.json();  // Extract userId from the request body

//     // Validate input
//     if (!userId) {
//       return new Response("Missing userId", { status: 400 });
//     }

//     // Check if the post is saved by the user
//     const savedPost = await prisma.savedPost.findFirst({
//       where: {
//         userId,
//         postId: params.postId,
//       },
//     });

//     if (savedPost) {
//       // Remove the saved post if it exists
//       await prisma.savedPost.delete({
//         where: {
//           id: savedPost.id,
//         },
//       });

//       return new Response(JSON.stringify({ isSaved: false }), { status: 200 });
//     } else {
//       // Add a new saved post if it doesn't exist
//       await prisma.savedPost.create({
//         data: {
//           userId,
//           postId: params.postId,
//         },
//       });

//       return new Response(JSON.stringify({ isSaved: true }), { status: 200 });
//     }
//   } catch (error) {
//     console.error("Error handling saved post:", error);
//     return new Response(`Error handling saved post: ${(error as Error).message}`, { status: 500 });
//   }
// }

// export async function GET(
//   req: Request,
//   { params }: { params: { postId: string } }
// ) {
//   try {
//     const url = new URL(req.url);
//     const userId = url.searchParams.get("userId");

//     // Validate input
//     if (!userId) {
//       return new Response("Missing userId", { status: 400 });
//     }

//     // Check if the post is saved by the user
//     const savedPost = await prisma.savedPost.findFirst({
//       where: {
//         userId,
//         postId: params.postId,
//       },
//     });

//     const isSaved = !!savedPost;

//     return new Response(JSON.stringify({ isSaved }), { status: 200 });
//   } catch (error) {
//     console.error("Error fetching saved post status:", error);
//     return new Response(`Error fetching saved post status: ${(error as Error).message}`, { status: 500 });
//   }
// }
// /src/app/api/posts/[postId]/saved-posts/route.ts
import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

// Handling POST request (Save post)
export async function POST(req: Request, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;
    const { userId } = await req.json();

    const savedPost = await prisma.savedPost.create({
      data: {
        userId,
        postId,
      },
    });

    return NextResponse.json({ message: 'Post saved successfully!', savedPost });
  } catch (error) {
    return NextResponse.json({ message: 'Error saving post', error }, { status: 500 });
  }
}

// Handling DELETE request (Unsave post)
export async function DELETE(req: Request, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;
    const { userId } = await req.json();

    const unsavedPost = await prisma.savedPost.deleteMany({
      where: {
        userId,
        postId,
      },
    });

    return NextResponse.json({ message: 'Post unsaved successfully!', unsavedPost });
  } catch (error) {
    return NextResponse.json({ message: 'Error unsaving post', error }, { status: 500 });
  }
}
