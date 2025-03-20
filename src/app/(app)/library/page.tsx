import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { BookCard } from "@/components/books/BookCard";

const prisma = new PrismaClient();

export default async function LibraryPage() {
  const books = await prisma.book.findMany({
    include: {
      createdBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });

  const articles = await prisma.article.findMany({
    include: {
      createdBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });

  return (
    
      E-Library
      
      
        
          Recent Books
          
            View all
          
        
        
          {books.map((book) => (
            
          ))}
        
      
      
      
        
          Recent Articles
          
            View all
          
        
        
          {articles.map((article) => (
            
              {article.title}
              {article.abstract && (
                {article.abstract}
              )}
              
                Read more
              
            
          ))}
        
      
    
  );
}