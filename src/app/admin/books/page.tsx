import type { Metadata } from "next";
import BooksClient from "src/components/admin/books/books-client";

export const metadata: Metadata = {
  title: "Books Management | EduConnect Admin",
  description: "Manage books on the EduConnect platform",
};

export default function BooksPage() {
  return <BooksClient />;
}
