"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAdmin, adminActions } from "@/context/admin-context";
import { BooksGrid } from "./books-grid";
import { BooksFilters } from "./books-filters";
import { CreateBookDialog } from "./create-book-dialog";

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

interface BooksResponse {
  books: Book[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function BooksClient() {
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });
  const [isCreateBookOpen, setIsCreateBookOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { dispatch } = useAdmin();

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "12");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        adminActions.setLoading(dispatch, true);
        setLoading(true);

        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.set("page", page.toString());
        queryParams.set("limit", limit.toString());
        if (search) queryParams.set("search", search);
        if (category && category !== "ALL")
          queryParams.set("category", category);

        const response = await axios.get<BooksResponse>(
          `/api/admin/books?${queryParams.toString()}`
        );

        setBooks(response.data.books);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems,
          itemsPerPage: response.data.itemsPerPage,
        });
      } catch (error) {
        console.error("Error fetching books:", error);
        adminActions.addAlert(dispatch, "Failed to fetch books", "error");
      } finally {
        setLoading(false);
        adminActions.setLoading(dispatch, false);
      }
    };

    fetchBooks();
  }, [page, limit, search, category, dispatch]);

  const handleBookCreated = () => {
    setIsCreateBookOpen(false);
    adminActions.addAlert(dispatch, "Book created successfully", "success");
    // Refresh the grid
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Books Management</h1>
        <Button onClick={() => setIsCreateBookOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>

      <BooksFilters />

      <BooksGrid books={books} pagination={pagination} loading={loading} />

      <CreateBookDialog
        open={isCreateBookOpen}
        onOpenChange={setIsCreateBookOpen}
        onSuccess={handleBookCreated}
      />
    </div>
  );
}
