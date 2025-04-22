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
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PdfViewer from "@/components/pdf-viewer";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const article = await getArticle(params.id);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: `${article.title} | EduConnect Articles`,
    description: article.abstract || article.title,
  };
}

// Fetch article data
async function getArticle(id: string) {
  try {
    const article = await prisma.article.findUnique({
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

    return article;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export default async function ArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  // Format dates
  const formattedDate = new Date(article.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const timeAgo = formatDistanceToNow(new Date(article.createdAt), {
    addSuffix: true,
  });

  // Convert markdown to HTML (optional)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/library/articles"
          className="inline-flex items-center text-emerald-700 dark:text-emerald-300 mb-6 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors group"
        >
          <ArrowLeft
            size={18}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          Back to Articles
        </Link>

        <article>
          <Card className="overflow-hidden border-emerald-100 dark:border-emerald-900/50 bg-white/90 dark:bg-gray-800/90 shadow-lg mb-8">
            {/* Featured Image */}
            {article.imageUrl && (
              <div className="relative h-80 w-full">
                <Image
                  src={article.imageUrl || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            )}

            {/* Article Header */}
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6">
                {article.category && (
                  <Badge className="mb-3 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60">
                    {article.category}
                  </Badge>
                )}
                <h1 className="text-3xl font-bold mb-3 text-emerald-900 dark:text-emerald-100">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center text-sm text-emerald-600/80 dark:text-emerald-400/80 mb-6 gap-4">
                  <div className="flex items-center">
                    <User size={16} className="mr-2" />
                    <span>{article.createdBy.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <span>{timeAgo}</span>
                  </div>
                </div>

                {/* Abstract */}
                {article.abstract && (
                  <div className="mb-6 text-lg font-medium text-emerald-700 dark:text-emerald-300 italic border-l-4 border-emerald-500 dark:border-emerald-600 pl-4 py-2 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-r-md">
                    {article.abstract}
                  </div>
                )}
              </div>

              <Separator className="my-6 bg-emerald-100 dark:bg-emerald-900/50" />

              {/* Main Content */}
              <div className="prose prose-emerald prose-lg max-w-none mb-8 dark:prose-invert prose-headings:text-emerald-900 dark:prose-headings:text-emerald-200 prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-strong:text-emerald-700 dark:prose-strong:text-emerald-300">
                {/* If using markdown: */}
                

                {/* Otherwise, use regular text with paragraphs:
                <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                  {article.content}
                </div> */}
              </div>

              {/* PDF Attachment */}
              {article.fileUrl && (
                <div className="mt-10 border-t border-emerald-100 dark:border-emerald-900/50 pt-6">
                  <h2 className="text-xl font-semibold mb-4 text-emerald-800 dark:text-emerald-200">
                    Attachments
                  </h2>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      asChild
                      className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
                    >
                      <a
                        href={article.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download size={16} className="mr-2" />
                        Download PDF
                      </a>
                    </Button>

                    <PdfViewer
                      fileUrl={article.fileUrl}
                      title={article.title}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Articles Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-emerald-800 dark:text-emerald-200">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* This would be populated with related articles */}
              {/* For now, we'll just show a placeholder */}
              <Card className="border-emerald-100 dark:border-emerald-900/50 bg-white/80 dark:bg-gray-800/80 hover:shadow-md transition-shadow">
                <div className="aspect-video relative bg-emerald-50 dark:bg-emerald-900/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText
                      size={40}
                      className="text-emerald-300 dark:text-emerald-700"
                    />
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-800 dark:text-emerald-200">
                    Related articles will appear here
                  </p>
                  <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                    Based on your interests
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
