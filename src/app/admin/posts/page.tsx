import type { Metadata } from "next";
import PostsClient from "src/components/admin/posts/posts-client";

export const metadata: Metadata = {
  title: "Posts Management | EduConnect Admin",
  description: "Manage posts on the EduConnect platform",
};

export default function PostsPage() {
  return <PostsClient />;
}
