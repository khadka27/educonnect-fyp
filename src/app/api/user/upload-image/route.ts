import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma"; // Adjust the import based on your project structure

export async function POST(request: Request) {
  try {
    // Ensure that the request is multipart/form-data
    const contentType = request.headers.get("Content-Type");
    if (!contentType || !contentType.startsWith("multipart/form-data")) {
      return new NextResponse("Invalid content type", { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;
    const imageType = formData.get("type") as string;
    const userId = formData.get("userId") as string;

    if (!file || !imageType || !userId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Define the path to save the image
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = path.join(process.cwd(), "public", "upload", fileName);
    const publicUrl = `/upload/${fileName}`;

    // Save the image to the file system
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Update the user's profile or cover image URL in the database
    await prisma.user.update({
      where: { id: userId },
      data: {
        [imageType === "profileImage" ? "profileImage" : "coverImage"]:
          publicUrl,
      },
    });

    return new NextResponse(JSON.stringify({ url: publicUrl }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error handling image upload:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
