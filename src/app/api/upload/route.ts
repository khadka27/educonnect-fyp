// import { NextResponse } from "next/server";
// import multer from "multer";
// import { promises as fs } from "fs";
// import path from "path";
// import { createReadStream } from "fs";

// const upload = multer({ dest: "public/upload/" });

// export async function POST(request: Request) {
//   // Handle file upload
//   const data = await request.formData();
//   const file = data.get("file") as File;

//   if (file) {
//     const filePath = path.join(process.cwd(), "public/uploads", file.name);
//     const fileStream = await file.text();
//     await fs.writeFile(filePath, fileStream);
//     return NextResponse.json({ filePath });
//   }

//   return NextResponse.error();
// }
