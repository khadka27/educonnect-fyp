import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options"; // Import auth options

export async function POST(req: Request) {
  try {
    // Fetch session from request
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Parsing form data
    const formData = await req.formData();
    const content = formData.get("content") as string;
    const files = formData.getAll("files") as File[];

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    // Handling file uploads (if there are any files)
    let postUrl: string | null = null;
    if (files.length > 0) {
      const file = files[0]; // Assuming only one file for simplicity
      const fileName = `${uuidv4()}-${file.name}`;
      const filePath = path.join(process.cwd(), "public", "upload", fileName);
      const buffer = Buffer.from(await file.arrayBuffer());

      // Save the file to the uploads directory
      fs.writeFileSync(filePath, buffer);

      // Generate a public URL for the uploaded file
      postUrl = `/upload/${fileName}`;
    }

    // Create the post in the database
    const post = await prisma.post.create({
      data: {
        content,
        postUrl,
        userId: session.user.id!, // Use the ID from session
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// GET: Fetch posts from the database
// export async function GET() {
//   try {
//     const posts = await prisma.post.findMany({
//       include: {
//         user: {
//           select: {
//             username: true,
//             profileImage: true, // Assuming this is the user's image field
//           },
//         },
//       },
//       orderBy: { createdAt: "desc" }, // Order posts by creation time
//     });

//     return NextResponse.json(posts);
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }





// GET: Fetch posts from the database with pagination

// export async function GET(request: Request) {
//   const url = new URL(request.url);
//   const page = parseInt(url.searchParams.get("page") || "1", 10);
//   const limit = 1000; // Number of posts per page

//   try {
//     const posts = await prisma.post.findMany({
//       skip: (page - 1) * limit,
//       take: limit,
//       orderBy: { createdAt: "desc" },
//       include: {
//         user: {
//           select: { username: true, profileImage: true },
//         },
//         comments: true,
//       },
//     });

//     const totalPosts = await prisma.post.count();
//     const hasMore = page * limit < totalPosts;

//     return NextResponse.json({
//       posts,
//       hasMore,
//     });
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch posts" },
//       { status: 500 }
//     );
//   }
// }


export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
  const limit = 10; // Reduce the number of posts per page for better performance

  try {
    const posts = await prisma.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { username: true, profileImage: true },
        },
        comments: {
          select: { content: true, userId: true }, // Limit fields
          take: 5, // Limit number of comments per post
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
    console.error("Error fetching posts:", (error as Error).message); // Log error message
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
