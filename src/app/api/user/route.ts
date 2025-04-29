import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("q");

  try {
    // If a search query is provided, perform a search
    if (searchQuery) {
      const users = await prisma.user.findMany({
        where: {
          AND: [
            {
              role: {
                in: ["USER", "TEACHER"],
              },
            },
            {
              OR: [
                { name: { contains: searchQuery, mode: "insensitive" } },
                { username: { contains: searchQuery, mode: "insensitive" } },
                { email: { contains: searchQuery, mode: "insensitive" } },
              ],
            },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profileImage: true,
          username: true,
        },
      });

      // Format results similar to the /api/search endpoint
      const formattedResults = users.map((user) => ({
        id: user.id,
        name: user.name,
        username: user.username || user.email?.split("@")[0],
        image: user.profileImage,
        type: "user",
        email: user.email,
        role: user.role,
      }));

      return NextResponse.json({ success: true, results: formattedResults });
    }

    // If no search query, return all users
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["USER", "TEACHER"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        username: true,
      },
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Error in user API route:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching users" },
      { status: 500 }
    );
  }
}
