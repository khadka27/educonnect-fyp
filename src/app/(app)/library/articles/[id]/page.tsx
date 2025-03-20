// src/app/library/articles/[id]/page.tsx
import { PrismaClient } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DeleteArticleButton } from "@/components/articles/DeleteArticleButton";
import { Metadata } from "next";

const prisma = new PrismaClient();

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
  });

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: article.title,
    description: article.abstract || `Read ${article.title} in our e-library`,
  };
}

export default async function ArticleDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!article) {
    notFound();
  }

  // Check if current user is the author or an admin
  const isAuthor = session?.user?.id === article.userId;
  const isAdmin = session?.user?.role === "ADMIN";
  const canEdit = isAuthor || isAdmin;

  // Format date
  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation and actions */}
        <div className="flex justify-between items-center mb-6">
          <Link 
            href="/library/articles" 
            className="text-blue-600 hover:underline flex items-center"
          >
            ← Back to Articles
          </Link>
          
          {canEdit && (
            <div className="flex gap-3">
              <Link 
                href={`/library/articles/${article.id}/edit`}
                className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
              >
                Edit
              </Link>
              <DeleteArticleButton articleId={article.id} />
            </div>
          )}
        </div>

        {/* Article header */}
        <header className="mb-8">
          {article.category && (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-3">
              {article.category}
            </span>
          )}
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex items-center text-gray-600 text-sm">
            <span>By {article.createdBy.name}</span>
            <span className="mx-2">•</span>
            <span>{formattedDate}</span>
          </div>
        </header>

        {/* Featured image */}
        {article.imageUrl && (
          <div className="relative h-80 w-full mb-8 rounded-lg overflow-hidden">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Abstract */}
        {article.abstract && (
          <div className="mb-8">
            <p className="text-lg text-gray-700 italic border-l-4 border-blue-500 pl-4 py-2">
              {article.abstract}
            </p>
          </div>
        )}

        {/* Article content */}
        <div className="prose prose-lg max-w-none">
          {/* Render content - if using Markdown, you'd parse it here */}
          {article.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}