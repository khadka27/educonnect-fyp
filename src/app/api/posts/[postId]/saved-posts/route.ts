import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const userId = req.session.user.id; // Assuming user is authenticated

    try {
      const savedPosts = await prisma.savedPost.findMany({
        where: { userId },
        include: {
          post: true, // Fetch the full post data
        },
      });
      res.status(200).json(savedPosts);
    } catch (error) {
      res.status(500).json({ error: "Error fetching saved posts" });
    }
  }
}
