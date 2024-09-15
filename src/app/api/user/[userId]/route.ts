// src/app/api/users/[userId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma"; // Ensure the path is correct
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

// export async function GET(
//   request: Request,
//   { params }: { params: { userId: string } }
// ) {
//   const { userId } = params;

//   try {
//     const user = await db.user.findUnique({
//       where: { id: userId },
//     });
//     console.log("User",userId)

//     if (!user) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }

//     return NextResponse.json(user);
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/users/[userId]/route.ts

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Handler for PUT requests to update user data
export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const { name, bio, address, profileImage, coverImage } = await request.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        bio,
        address,
        profileImage,
        coverImage,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handler for POST requests to verify password
export async function POST(request: Request) {
  const { id, password } = await request.json();

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!user || !user.password) {
      return NextResponse.json({ match: false });
    }

    const passwordMatch = await compare(password, user.password);
    return NextResponse.json({ match: passwordMatch });
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handler for DELETE requests to delete a user
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
