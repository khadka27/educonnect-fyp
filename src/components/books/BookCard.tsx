"use client";

// src/components/books/BookCard.tsx
import Image from "next/image";
import Link from "next/link";
import { Book } from "@prisma/client";

interface BookCardProps {
  book: Book & {
    createdBy: {
      id: string;
      name: string;
    };
  };
}

export function BookCard({ book }: BookCardProps) {
  // Format date to readable format
  const formattedDate = new Date(book.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        {book.imageUrl ? (
          <Image
            src={book.imageUrl}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-500">No image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-col h-full">
          <div>
            {book.category && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                {book.category}
              </span>
            )}
            <h3 className="text-lg font-semibold line-clamp-1">{book.title}</h3>
            <p className="text-sm text-gray-600 mb-2">by {book.author}</p>

            {book.publishedYear && (
              <p className="text-sm text-gray-500 mb-1">
                Published: {book.publishedYear}
              </p>
            )}
          </div>

          <div className="mt-auto pt-3 flex justify-between items-center">
            <span className="text-xs text-gray-500">{formattedDate}</span>
            <Link
              href={`/library/books/${book.id}`}
              className="text-blue-600 hover:underline text-sm"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
