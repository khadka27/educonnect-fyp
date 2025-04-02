// app/api/auth/check-admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);

    // If no session, or user is not authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { isAdmin: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if the user has the ADMIN role
    const isAdmin = session.user.role === "ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        { isAdmin: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    // Return success response for admin users
    return NextResponse.json({
      isAdmin: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
    });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json(
      { isAdmin: false, message: "Authentication check failed" },
      { status: 500 }
    );
  }
}
