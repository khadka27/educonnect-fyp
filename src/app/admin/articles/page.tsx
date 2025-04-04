import type { Metadata } from "next"
import ArticlesClient from "src/components/admin/articles/articles-client"

export const metadata: Metadata = {
  title: "Articles Management | EduConnect Admin",
  description: "Manage articles on the EduConnect platform",
}

export default function ArticlesPage() {
  return <ArticlesClient />
}

