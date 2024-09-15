/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: {
    method: string;
    query: { postId: any };
    body: { comment: any };
    session: { user: { id: any } };
  },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: {
        (arg0: {
          id: string;
          content: string;
          createdAt: Date;
          updatedAt: Date;
          userId: string;
          postId: string;
        }): void;
        new (): any;
      };
    };
  }
) {
  if (req.method === "POST") {
    const { postId } = req.query;
    const { comment } = req.body;

    try {
      const newComment = await prisma.comment.create({
        data: {
          content: comment,
          postId: postId,
          userId: req.session.user.id, // Assuming user is authenticated
        },
      });
      res.status(200).json(newComment);
    } catch (error) {
      res.status(500).json({
        id: "",
        content: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "",
        postId: "",
      });
    }
  }
}
