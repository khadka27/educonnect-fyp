import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter } from "src/components/ui/card"
import { Badge } from "src/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, User, ArrowRight } from "lucide-react"

interface ArticleCardProps {
  article: any
}

export function ArticleCard({ article }: ArticleCardProps) {
  // Format the date as "time ago"
  const timeAgo = formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })

  return (
    <Card className="overflow-hidden border-teal-100 dark:border-teal-900/50 bg-white/90 dark:bg-gray-800/90 hover:shadow-md transition-all h-full flex flex-col">
      <div className="relative h-48 w-full bg-teal-50 dark:bg-teal-900/20">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl || "/placeholder.svg"}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FileText className="h-12 w-12 text-teal-300 dark:text-teal-700" />
          </div>
        )}
      </div>

      <CardContent className="p-5 flex-grow">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-xl font-semibold text-teal-800 dark:text-teal-200 line-clamp-2">{article.title}</h3>
          {article.category && (
            <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:hover:bg-teal-900/60 whitespace-nowrap">
              {article.category}
            </Badge>
          )}
        </div>

        {article.abstract && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm">{article.abstract}</p>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-0 border-t border-teal-100 dark:border-teal-900/50 mt-auto">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center text-sm text-teal-600 dark:text-teal-400">
            <User className="h-3.5 w-3.5 mr-1" />
            <span className="line-clamp-1">{article.createdBy.name}</span>
            <span className="mx-2">•</span>
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <span>{timeAgo}</span>
          </div>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20 -mr-2"
          >
            <Link href={`/library/articles/${article.id}`}>
              Read
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

