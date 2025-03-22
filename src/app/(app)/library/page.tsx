// src/app/library/page.tsx
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BookCard } from "src/components/books/BookCard";

const prisma = new PrismaClient();

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  const isTeacher =
    session?.user?.role === "TEACHER" || session?.user?.role === "ADMIN";

  // Fetch recent books
  const books = await prisma.book.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });

  // Fetch recent articles
  const articles = await prisma.article.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">E-Library</h1>
        {isTeacher && (
          <div className="flex gap-3">
            <Link
              href="/library/books/add"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Book
            </Link>
            <Link
              href="/library/articles/add"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Write Article
            </Link>
          </div>
        )}
      </div>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Recent Books</h2>
          <Link href="/library/books" className="text-blue-600 hover:underline">
            View all books
          </Link>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No books available yet.</p>
            {isTeacher && (
              <Link
                href="/library/books/add"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add the first book
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Recent Articles</h2>
          <Link
            href="/library/articles"
            className="text-blue-600 hover:underline"
          >
            View all articles
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No articles available yet.</p>
            {isTeacher && (
              <Link
                href="/library/articles/add"
                className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Write the first article
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{article.title}</h3>
                  {article.category && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {article.category}
                    </span>
                  )}
                </div>
                {article.abstract && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.abstract}
                  </p>
                )}
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">
                    By {article.createdBy.name}
                  </span>
                  <Link
                    href={`/library/articles/${article.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Read more
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
