// import { NextResponse } from 'next/server';
// import {prisma} from '@/lib/prisma';

// export async function GET({ params }: { params: { postId: string } }) {
//   const { postId } = params;
//   try {
//     const post = await prisma.post.findUnique({
//       where: { id:postId },
//       include: {
//         user: true,
//         reactions: true,
//         comments: true,
//         shares: true,
//         savedBy: true
//       }
//     });
//     if (post) {
//       return NextResponse.json(post);
//     } else {
//       return NextResponse.error();
//     }
//   } catch (error) {
//     return NextResponse.error();
//   }
// }

// export async function PUT({ params, request }: { params: { postId: string }, request: Request }) {
//   const { postId } = params;
//   try {
//     const { content, postUrl } = await request.json();
//     const post = await prisma.post.update({
//       where: { id:postId },
//       data: { content, postUrl }
//     });
//     return NextResponse.json(post);
//   } catch (error) {
//     return NextResponse.error();
//   }
// }

// export async function DELETE({ params }: { params: { postId: string } }) {
//   const { postId } = params;
//   try {
//     await prisma.post.delete({ where: { id:postId } });
//     return NextResponse.json({ message: 'Post deleted' });
//   } catch (error) {
//     return NextResponse.error();
//   }
// }


// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/options"; // Ensure path is correct
// import { prisma } from "@/lib/prisma";

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user) {
//       return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
//         status: 401,
//       });
//     }

//     const url = new URL(req.url);
//     const postId = url.pathname.split("/")[3]; // Extract postId from URL
//     const userId = session.user.id;

//     console.log("postId", postId);
//     console.log ("userId", userId);

//     if (!userId) {
//       return new NextResponse("Invalid or missing userId", { status: 400 });
//     }

//     if (!postId || typeof postId !== "string") {
//       return new NextResponse("Invalid or missing postId", { status: 400 });
//     }

//     // Check if the post is already saved by the user
//     const existingSave = await prisma.savedPost.findFirst({
//       where: { postId, userId },
//     });
//     console.log("existingSave", existingSave);

//     if (existingSave) {
//       return new NextResponse("Post already saved", { status: 400 });
//     }

//     // Save the post
//     await prisma.savedPost.create({
//       data: {
//         postId,
//         userId,
//       },
//     });

//     return new NextResponse("Post saved successfully", { status: 200 });
//   } catch (error) {
//     console.error("Error saving post:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }
