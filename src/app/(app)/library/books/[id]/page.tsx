import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Download,
  User,
  BookOpen,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "src/components/ui/badge";
import { Card, CardContent } from "src/components/ui/card";
import { Separator } from "src/components/ui/separator";
import PdfViewer from "src/components/pdf-viewer";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const book = await getBook(params.id);

  if (!book) {
    return {
      title: "Book Not Found",
    };
  }

  return {
    title: `${book.title} | EduConnect Library`,
    description: book.description || `Book by ${book.author}`,
  };
}

// Fetch book data
async function getBook(id: string) {
  try {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return book;
  } catch (error) {
    console.error("Error fetching book:", error);
    return null;
  }
}

export default async function BookPage({ params }: { params: { id: string } }) {
  const book = await getBook(params.id);

  if (!book) {
    notFound();
  }

  // Format date
  const formattedDate = new Date(book.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/library/books"
          className="inline-flex items-center text-emerald-700 dark:text-emerald-300 mb-6 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors group"
        >
          <ArrowLeft
            size={18}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          Back to Books
        </Link>

        <Card className="overflow-hidden border-emerald-100 dark:border-emerald-900/50 bg-white/90 dark:bg-gray-800/90 shadow-lg">
          <div className="md:flex">
            {/* Book Cover */}
            <div className="md:w-1/3 relative">
              {book.imageUrl ? (
                <div className="h-96 md:h-full relative">
                  <Image
                    src={book.imageUrl || "/placeholder.svg"}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-r md:from-black/20 md:to-transparent"></div>
                </div>
              ) : (
                <div className="h-96 md:h-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <BookOpen
                    size={80}
                    className="text-emerald-400 dark:text-emerald-600"
                  />
                </div>
              )}
            </div>

            {/* Book Details */}
            <div className="md:w-2/3 p-6 md:p-8">
              <div className="mb-6">
                {book.category && (
                  <Badge className="mb-3 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60">
                    {book.category}
                  </Badge>
                )}
                <h1 className="text-3xl font-bold mb-2 text-emerald-900 dark:text-emerald-100">
                  {book.title}
                </h1>
                <p className="text-xl text-emerald-700 dark:text-emerald-300 mb-4">
                  by {book.author}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-emerald-600 dark:text-emerald-400 mb-6">
                  {book.publishedYear && (
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      <span>Published: {book.publishedYear}</span>
                    </div>
                  )}
                  {book.isbn && (
                    <div className="flex items-center">
                      <FileText size={16} className="mr-2" />
                      <span>
                        <span className="font-medium">ISBN:</span> {book.isbn}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-emerald-600/80 dark:text-emerald-400/80 mb-6">
                  <div className="flex items-center">
                    <User size={16} className="mr-2" />
                    <span>Added by: {book.createdBy.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <span>Added on: {formattedDate}</span>
                  </div>
                </div>
              </div>

              <Separator className="my-6 bg-emerald-100 dark:bg-emerald-900/50" />

              {book.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3 text-emerald-800 dark:text-emerald-200">
                    Description
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}

              {book.fileUrl && (
                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
                  >
                    <a
                      href={book.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download size={16} className="mr-2" />
                      Download PDF
                    </a>
                  </Button>

                  <PdfViewer fileUrl={book.fileUrl} title={book.title} />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Related Books Section - Could be added here */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-emerald-800 dark:text-emerald-200">
            You might also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* This would be populated with related books */}
            {/* For now, we'll just show a placeholder */}
            <Card className="border-emerald-100 dark:border-emerald-900/50 bg-white/80 dark:bg-gray-800/80 hover:shadow-md transition-shadow">
              <div className="aspect-[2/3] relative bg-emerald-50 dark:bg-emerald-900/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen
                    size={40}
                    className="text-emerald-300 dark:text-emerald-700"
                  />
                </div>
              </div>
              <CardContent className="p-4">
                <p className="font-medium text-emerald-800 dark:text-emerald-200">
                  Related books will appear here
                </p>
                <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                  Based on your interests
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
