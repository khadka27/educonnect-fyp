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
