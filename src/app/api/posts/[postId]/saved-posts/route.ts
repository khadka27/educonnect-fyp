import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import {prisma} from '@/lib/prisma'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const postId = req.query.postId as string;
    const userId = session.user.id as string;

    try {
      // Check if the post is already saved by the user
      const existingSave = await prisma.savedPost.findFirst({
        where: { postId, userId },
      });

      if (existingSave) {
        return res.status(400).json({ error: 'Post already saved' });
      }

      // Save the post
      await prisma.savedPost.create({
        data: {
          postId,
          userId,
        },
      });

      return res.status(200).json({ message: 'Post saved successfully' });
    } catch (error) {
      console.error('Error saving post:', error);
      return res.status(500).json({ error: 'Failed to save post' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
