import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ArticleCard } from "src/components/articles/ArticleCard"
import { Button } from "@/components/ui/button"
import { Input } from "src/components/ui/input"
import { FileText, Plus, Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select"

const prisma = new PrismaClient()

export default async function ArticlesPage() {
  const session = await getServerSession(authOptions)
  const isTeacher =
    session?.user?.role === "TEACHER" || session?.user?.role === "ADMIN" || session?.user?.role === "USER"

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
  })

  // Extract unique categories for the filter dropdown
  const categories = Array.from(
    new Set(articles.filter((article) => article.category).map((article) => article.category)),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-teal-800 dark:text-teal-200 flex items-center">
            <FileText className="mr-3 h-8 w-8 text-teal-600 dark:text-teal-400" />
            Articles
          </h1>

          {isTeacher && (
            <Button
              asChild
              className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-800"
            >
              <Link href="/library/articles/add">
                <Plus className="mr-2 h-4 w-4" />
                Add New Article
              </Link>
            </Button>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/80 dark:bg-gray-800/60 rounded-lg p-4 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500 dark:text-teal-400" />
              <Input
                placeholder="Search articles..."
                className="pl-10 border-teal-200 dark:border-teal-800 focus-visible:ring-teal-500"
              />
            </div>

            {categories.length > 0 && (
              <div className="w-full sm:w-64">
                <Select>
                  <SelectTrigger className="border-teal-200 dark:border-teal-800 focus:ring-teal-500">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4 text-teal-500 dark:text-teal-400" />
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

        {articles.length === 0 ? (
          <div className="text-center py-16 bg-white/60 dark:bg-gray-800/40 rounded-lg shadow-sm">
            <FileText className="h-16 w-16 mx-auto text-teal-400 dark:text-teal-600 mb-4" />
            <p className="text-teal-600 dark:text-teal-400 text-lg mb-6">No articles available yet.</p>
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
          <>
            <p className="text-teal-700 dark:text-teal-300 mb-6">
              Showing {articles.length} article{articles.length !== 1 ? "s" : ""}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}

        {/* Back to Library Link */}
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            asChild
            className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-900/30"
          >
            <Link href="/library">Back to Library</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

