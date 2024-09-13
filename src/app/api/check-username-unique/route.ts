import { db } from "@/lib/prisma";
import { z } from "zod";
import { usernameValidation } from "@/Schema/Sign-up-schema";
import { NextResponse } from "next/server";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await db;
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username"),
    };

    // Validate with zod
    const result = UsernameQuerySchema.safeParse(queryParams);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return NextResponse.json(
        {
          success: false,
          message:
            usernameErrors.length > 0 ? usernameErrors[0] : "Invalid username",
        },
        {
          status: 400,
        }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await db.user.findFirst({
      where: {
        username: username || undefined, // Handle null or undefined username
        isVerified: true,
      },
    });

    if (existingVerifiedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already exists",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Username is unique",
    });
  } catch (error) {
    console.error("Error checking username uniqueness", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error checking username uniqueness",
      },
      {
        status: 500,
      }
    );
  }
}
