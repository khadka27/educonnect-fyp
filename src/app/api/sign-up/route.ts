import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { userSchema } from "@/Schema/Sign-up-schema";
import { isValidEmail } from "@/utils/validation";
import { sendVerificationEmail } from "@/utils/sendVerificationEmail"; // Ensure this function exists and is correct

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = userSchema.parse(body); // Validate the request body

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 }
      );
    }

    // If username already exists
    const existingUserByUsername = await db.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        { user: null, message: "Username already exists" },
        { status: 409 }
      );
    }

    // If email already exists
    const existingUserByEmail = await db.user.findUnique({
      where: { email },
    });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a random 6-digit number

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          { user: null, message: "Email already exists" },
          { status: 409 }
        );
      } else {
        // Update existing user with new password and verification code
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            verifyCode,
            isVerified: false,
            verifyCodeExpiry: new Date(Date.now() + 3600000), // Set expiry date to 1 hour from now
          },
        });

        // Send verification email
        await sendVerificationEmail(email, verifyCode, username);

        return NextResponse.json(
          { user: null, message: "User updated. Please verify your email" },
          { status: 200 }
        );
      }
    } else {
      // Create a new user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry date to 1 hour from now

      const newUser = await db.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          verifyCode,
          verifyCodeExpiry: expiryDate,
          isVerified: false,
          isAcceptingMessages: true,
          messages: {
            create: [],
          },
        },
      });

      // Send verification email
      await sendVerificationEmail(email, verifyCode, username);

      return NextResponse.json(
        {
          user: newUser,
          message: "User registered successfully. Please verify your email",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error registering user", error);
    return NextResponse.json(
      { message: "Error registering user" },
      { status: 500 }
    );
  }
}
