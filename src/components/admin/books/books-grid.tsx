"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card, CardContent, CardFooter } from "src/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash,
  FileText,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { EditBookDialog } from "./edit-book-dialog";
import { DeleteBookDialog } from "./delete-book-dialog";
import { useAdmin, adminActions } from "@/context/admin-context";
import axios from "axios";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  isbn: string | null;
  category: string | null;
  publishedYear: number | null;
  imageUrl: string | null;
  fileUrl: string | null;
  createdAt: string;
  createdBy: {
    name: string;
  };
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface BooksGridProps {
  books: Book[];
  pagination: PaginationData;
  loading: boolean;
}

export function BooksGrid({ books, pagination, loading }: BooksGridProps) {
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { dispatch } = useAdmin();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBookUpdated = () => {
    setBookToEdit(null);
    adminActions.addAlert(dispatch, "Book updated successfully", "success");
    router.refresh();
  };

  const handleBookDeleted = async () => {
    if (!bookToDelete) return;

    try {
      adminActions.setLoading(dispatch, true);
      await axios.delete(`/api/admin/books/${bookToDelete.id}`);

      setBookToDelete(null);
      adminActions.addAlert(dispatch, "Book deleted successfully", "success");
      router.refresh();
    } catch (error) {
      console.error("Error deleting book:", error);
      adminActions.addAlert(dispatch, "Failed to delete book", "error");
    } finally {
      adminActions.setLoading(dispatch, false);
    }
  };

  const handleDownload = (book: Book) => {
    if (book.fileUrl) {
      window.open(book.fileUrl, "_blank");
    } else {
      adminActions.addAlert(
        dispatch,
        "No file available for download",
        "warning"
      );
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: pagination.itemsPerPage }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[3/4] w-full animate-pulse bg-muted"></div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted"></div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="h-9 w-full animate-pulse rounded bg-muted"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-medium">No books found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl || "/placeholder.svg"}
                    alt={book.title}
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                {book.category && (
                  <Badge className="absolute right-2 top-2">
                    {book.category}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-1">{book.title}</h3>
                <p className="text-sm text-muted-foreground">{book.author}</p>
                {book.publishedYear && (
                  <p className="text-xs text-muted-foreground">
                    Published: {book.publishedYear}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Added by {book.createdBy.name} on{" "}
                  {format(new Date(book.createdAt), "MMM d, yyyy")}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="flex w-full justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(book)}
                    disabled={!book.fileUrl}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setBookToEdit(book)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setBookToDelete(book)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
          {Math.min(
            pagination.currentPage * pagination.itemsPerPage,
            pagination.totalItems
          )}{" "}
          of {pagination.totalItems}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={
              pagination.currentPage >= pagination.totalPages || loading
            }
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>

      {bookToEdit && (
        <EditBookDialog
          book={bookToEdit}
          open={!!bookToEdit}
          onOpenChange={() => setBookToEdit(null)}
          onSuccess={handleBookUpdated}
        />
      )}

      {bookToDelete && (
        <DeleteBookDialog
          book={bookToDelete}
          open={!!bookToDelete}
          onOpenChange={() => setBookToDelete(null)}
          onSuccess={handleBookDeleted}
        />
      )}
    </div>
  );
}
