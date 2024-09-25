// src/app/api/users/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the path based on your setup

export async function GET() {
  try {
    const users = await prisma.user.findMany(); // Fetch all users
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to fetch users." }, { status: 500 });
  }
}
