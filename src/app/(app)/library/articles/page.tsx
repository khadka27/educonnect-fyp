// src/app/library/articles/page.tsx
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ArticleCard } from "@/components/articles/ArticleCard";

const prisma = new PrismaClient();

export default async function ArticlesPage() {
  const session = await getServerSession(authOptions);
  const isTeacher =
    session?.user?.role === "TEACHER" || session?.user?.role === "ADMIN";

  const articles = await prisma.article.findMany({
    include: {
      createdBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Articles</h1>
        {isTeacher && (
          <Link
            href="/library/articles/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add New Article
          </Link>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No articles available yet.</p>
          {isTeacher && (
            <Link
              href="/library/articles/add"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add the first article
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
