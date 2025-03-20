"use client";

import Image from "next/image";
import Link from "next/link";
import { Book } from "@prisma/client";

interface BookCardProps {
  book: Book & {
    createdBy: {
      name: string;
    };
  };
}

export function BookCard({ book }: BookCardProps) {
  return (
    
      
        {book.imageUrl ? (
          
        ) : (
          
            No image
          
        )}
      
      
        {book.title}
        by {book.author}
        {book.category && (
          
            {book.category}
          
        )}
        
          
            View details
          
        
      
    
  );
}