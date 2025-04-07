export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

export interface Reaction {
  id: string;
  type: "like" | "love" | "haha" | "wow" | "sad" | "angry";
  user: User;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  author: User;
  comments: Comment[];
  reactions: Reaction[];
  saves: User[];
  viewCount: number;
  slug: string;
  tags: string[];
}
