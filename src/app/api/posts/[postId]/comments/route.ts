// import { prisma } from "@/lib/prisma";

// export async function POST(req: Request) {
//   try {
//     const { userId, postId, content } = await req.json();

//     if (!userId || !postId || !content) {
//       return new Response("Missing data", { status: 400 });
//     }

//     const comment = await prisma.comment.create({
//       data: {
//         content,
//         user: { connect: { id: userId } },
//         post: { connect: { id: postId } },
//       },
//     });

//     return new Response(JSON.stringify(comment), { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return new Response("Error adding comment", { status: 500 });
//   }
// }

// // get all comments for a post

// export async function GET(
//   req: Request,
//   { params }: { params: { postId: string } }
// ) {
//   try {
//     const comments = await prisma.comment.findMany({
//       where: { postId: params.postId },
//       include: {
//         user: {
//           select: {
//             username: true, // Include the username field from the user
//             profileImage: true, // Optionally include other fields like profileImage
//           },
//         },
//       },
//       orderBy: { createdAt: "asc" }, // Order comments by creation date
//     });

//     return new Response(JSON.stringify(comments), { status: 200 });
//   } catch (error) {
//     console.error("Error fetching comments:", error);
//     return new Response("Error fetching comments", { status: 500 });
//   }
// }

// POST: Add a comment
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { userId, postId, content } = await req.json();

    if (!userId || !postId || !content) {
      return new NextResponse("Missing data", { status: 400 });
    }

    // Optional: Validate if userId and postId exist in the database
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    const postExists = await prisma.post.findUnique({ where: { id: postId } });

    if (!userExists) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (!postExists) {
      return new NextResponse("Post not found", { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        user: { connect: { id: userId } },
        post: { connect: { id: postId } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// get all comments for a post
// Fetch all posts and their related comments in one go
// export async function GET(req: Request) {
//   try {
//     const postsWithComments = await prisma.post.findMany({
//       include: {
//         comments: {
//           include: {
//             user: {
//               select: {
//                 username: true,
//                 profileImage: true,
//               },
//             },
//           },
//           orderBy: { createdAt: "asc" },
//         },
//       },
//       // Optional: Limit the number of posts fetched and implement pagination
//       // take: 20,
//       // skip: 0,
//     });

//     return new Response(JSON.stringify(postsWithComments), { status: 200 });
//   } catch (error) {
//     console.error("Error fetching posts with comments:", error);
//     return new Response("Error fetching posts with comments", { status: 500 });
//   }
// }

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
  const limit = 10;

  try {
    const posts = await prisma.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" }, // Ordering posts by createdAt (latest first)
      include: {
        user: {
          select: {
            username: true, // Include username field
            profileImage: true,
            // Include profileImage field
          },
        },
        comments: {
          include: {
            user: {
              select: {
                username: true, // Include username of the user who commented
                profileImage: true, // Include profile image of the user who commented
                createdAt: true, // Include creation date of the user who commented
              },
            },
          },
          orderBy: { createdAt: "asc" }, // Order comments by creation date
          take: 5, // Limit number of comments to 5 per post
        },
      },
    });

    const totalPosts = await prisma.post.count();
    const hasMore = page * limit < totalPosts;

    return NextResponse.json({
      posts,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching posts:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
