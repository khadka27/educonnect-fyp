import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BookCard } from "src/components/books/BookCard";
import { ArticleCard } from "src/components/articles/ArticleCard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "src/components/ui/input";
import { BookOpen, FileText, Plus, Search } from "lucide-react";

const prisma = new PrismaClient();

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  const isTeacher =
    session?.user?.role === "TEACHER" || session?.user?.role === "USER";

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center">
            <BookOpen className="mr-3 h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            E-Library
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              <Input
                placeholder="Search books & articles..."
                className="pl-10 border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
              />
            </div>

            {/* Add Buttons for Teachers */}
            {isTeacher && (
              <div className="flex gap-3">
                <Button
                  asChild
                  className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
                >
                  <Link href="/library/books/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Book
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-800"
                >
                  <Link href="/library/articles/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Write Article
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="books" className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-emerald-100/70 dark:bg-emerald-900/30">
            <TabsTrigger
              value="books"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:bg-emerald-700"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Books
            </TabsTrigger>
            <TabsTrigger
              value="articles"
              className="data-[state=active]:bg-teal-600 data-[state=active]:text-white dark:data-[state=active]:bg-teal-700"
            >
              <FileText className="mr-2 h-4 w-4" />
              Articles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-200">
                Recent Books
              </h2>
              <Button
                variant="outline"
                asChild
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
              >
                <Link href="/library/books">View all books</Link>
              </Button>
            </div>

            {books.length === 0 ? (
              <div className="text-center py-12 bg-white/60 dark:bg-gray-800/40 rounded-lg shadow-sm">
                <FileText className="h-12 w-12 mx-auto text-emerald-400 dark:text-emerald-600 mb-4" />
                <p className="text-emerald-600 dark:text-emerald-400 mb-4">
                  No books available yet.
                </p>
                {isTeacher && (
                  <Button
                    asChild
                    className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
                  >
                    <Link href="/library/books/add">
                      <Plus className="mr-2 h-4 w-4" />
                      Add the first book
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="articles" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-teal-800 dark:text-teal-200">
                Recent Articles
              </h2>
              <Button
                variant="outline"
                asChild
                className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-900/30"
              >
                <Link href="/library/articles">View all articles</Link>
              </Button>
            </div>

            {articles.length === 0 ? (
              <div className="text-center py-12 bg-white/60 dark:bg-gray-800/40 rounded-lg shadow-sm">
                <FileText className="h-12 w-12 mx-auto text-teal-400 dark:text-teal-600 mb-4" />
                <p className="text-teal-600 dark:text-teal-400 mb-4">
                  No articles available yet.
                </p>
                {isTeacher && (
                  <Button
                    asChild
                    className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-800"
                  >
                    <Link href="/library/articles/add">
                      <Plus className="mr-2 h-4 w-4" />
                      Write the first article
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
