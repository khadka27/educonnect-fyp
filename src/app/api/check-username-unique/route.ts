import { db } from "@/lib/prisma";
import { z } from "zod";
import { usernameValidation } from "@/Schema/Sign-up-schema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await db;
  try {
    const { searchParams } = new URL(request.url);
    const quaryParams = {
      username: searchParams.get("username"),
    };
    //valiadate with zod
    const result = UsernameQuerySchema.safeParse(quaryParams);
    console.log(result); //it should be removed

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0 ? usernameErrors[0] : "Invalid username",
        },
        {
          status: 400,
        }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await db.user.findUnique({
      where: {
        username,
        isVerified: true,
      },
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        {
          status: 402,
        }
      );
    }

    return Response.json({
      success: true,
      message: "Username is unique",
    });
  } catch (error) {
    console.error("Error checking username unique", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username unique",
      },
      {
        status: 500,
      }
    );
  }
}
