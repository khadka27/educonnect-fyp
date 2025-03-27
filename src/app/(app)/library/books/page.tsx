import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BookCard } from "src/components/books/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "src/components/ui/input";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const prisma = new PrismaClient();

export default async function BooksPage() {
  const session = await getServerSession(authOptions);
  const isTeacher =
    session?.user?.role === "TEACHER" || session?.user?.role === "USER";

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
  });

  // Extract unique categories and authors for filter dropdowns
  const categories = Array.from(
    new Set(books.filter((book) => book.category).map((book) => book.category))
  );

  const authors = Array.from(
    new Set(books.filter((book) => book.author).map((book) => book.author))
  );

  // Get unique years for the year filter
  const years = Array.from(
    new Set(
      books
        .filter((book) => book.publishedYear)
        .map((book) => book.publishedYear)
    )
  ).sort((a, b) => Number(b) - Number(a)); // Sort years in descending order

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center">
            <BookOpen className="mr-3 h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            Books
          </h1>

          {isTeacher && (
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
            >
              <Link href="/library/books/add">
                <Plus className="mr-2 h-4 w-4" />
                Add New Book
              </Link>
            </Button>
          )}
        </div>

        {/* Search and Basic Filter Bar */}
        <div className="bg-white/80 dark:bg-gray-800/60 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              <Input
                placeholder="Search books by title, author, or ISBN..."
                className="pl-10 border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
              />
            </div>

            {categories.length > 0 && (
              <div className="w-full sm:w-64">
                <Select>
                  <SelectTrigger className="border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      <SelectValue placeholder="Filter by category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Filters (Collapsible) */}
        <Accordion
          type="single"
          collapsible
          className="bg-white/80 dark:bg-gray-800/60 rounded-lg mb-8 shadow-sm"
        >
          <AccordionItem value="advanced-filters" className="border-b-0">
            <AccordionTrigger className="px-4 py-3 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 rounded-t-lg">
              <div className="flex items-center">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Advanced Filters
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {authors.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1 block">
                      Author
                    </label>
                    <Select>
                      <SelectTrigger className="border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500">
                        <SelectValue placeholder="All authors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Authors</SelectItem>
                        {authors.map((author) => (
                          <SelectItem key={author} value={author}>
                            {author}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {years.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1 block">
                      Published Year
                    </label>
                    <Select>
                      <SelectTrigger className="border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500">
                        <SelectValue placeholder="Any year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Year</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1 block">
                    Sort By
                  </label>
                  <Select>
                    <SelectTrigger className="border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500">
                      <SelectValue placeholder="Newest first" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                      <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                      <SelectItem value="author-asc">Author (A-Z)</SelectItem>
                      <SelectItem value="author-desc">Author (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {books.length === 0 ? (
          <div className="text-center py-16 bg-white/60 dark:bg-gray-800/40 rounded-lg shadow-sm">
            <BookOpen className="h-16 w-16 mx-auto text-emerald-400 dark:text-emerald-600 mb-4" />
            <p className="text-emerald-600 dark:text-emerald-400 text-lg mb-6">
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
          <>
            <p className="text-emerald-700 dark:text-emerald-300 mb-6">
              Showing {books.length} book{books.length !== 1 ? "s" : ""}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </>
        )}

        {/* Back to Library Link */}
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            asChild
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
          >
            <Link href="/library">Back to Library</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
