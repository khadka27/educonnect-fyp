import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import based on your setup

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        profileImage: true,
        username: true,
      },
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to fetch users." }, { status: 500 });
  }
}
