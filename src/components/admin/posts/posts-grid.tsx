import type { Post } from "src/types"
import { DataTable } from "src/components/ui/data-table"
import { columns } from "./columns"

interface PostsGridProps {
  posts: Post[]
  pagination: {
    currentPage: number
    itemsPerPage: number
    totalItems: number
  }
}

export function PostsGrid({ posts, pagination }: PostsGridProps) {
  return (
    <div>
      <DataTable columns={columns} data={posts} />
      <div className="flex items-center justify-between space-x-2 py-2">
        <div className="text-sm text-muted-foreground">
          Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems}
        </div>
      </div>
    </div>
  )
}

