// pages/api/posts.ts
import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { offset } = req.query;
    const posts = await prisma.post.findMany({
      skip: Number(offset),
      take: 10,
      include: { user: true, comments: true },
    });
    res.status(200).json(posts);
  } else if (req.method === 'POST') {
    const { content, image, file, link } = req.body;
    const newPost = await prisma.post.create({
      data: {
        content,
        image,
        file,
        link,
        user: { connect: { id: (req as any).user.id } },
      },
    });
    res.status(201).json(newPost);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
