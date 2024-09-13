import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all posts
export async function GET() {
  const posts = await prisma.post.findMany();
  return NextResponse.json(posts);
}

// POST a new post
export async function POST(request: Request) {
  const { content, author, image, link } = await request.json();
  const newPost = await prisma.post.create({
    data: {
      content,
      image,
      link,
      author,
    },
  });
  return NextResponse.json(newPost);
}

// GET a single post by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: Number(params.id) },
  });
  if (!post) return NextResponse.error();
  return NextResponse.json(post);
}

// PUT update a post by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { content, link } = await request.json();
  const updatedPost = await prisma.post.update({
    where: { id: Number(params.id) },
    data: { content, link },
  });
  return NextResponse.json(updatedPost);
}

// DELETE a post by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await prisma.post.delete({
    where: { id: Number(params.id) },
  });
  return NextResponse.json({ message: 'Post deleted successfully' });
}
