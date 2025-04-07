"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "src/components/ui/badge";
import { format } from "date-fns";
import { Post } from "@/types";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";

export const columns: ColumnDef<Post>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const post = row.original;
      return (
        <div className="flex items-center gap-2">
          {post.image && (
            <div className="h-10 w-10 rounded-md overflow-hidden">
              <img
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="font-medium">
            <Link href={`/admin/posts/${post.id}`} className="hover:underline">
              {post.title}
            </Link>
            {post.featured && (
              <Star className="h-4 w-4 text-yellow-400 inline ml-1" />
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => {
      const author = row.original.author;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={author?.image || ""}
              alt={author?.name || "Unknown"}
            />

            <AvatarFallback>
              {author?.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{author?.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "published",
    header: "Status",
    cell: ({ row }) => {
      const isPublished = row.original.published;
      return (
        <Badge variant={isPublished ? "default" : "outline"}>
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "viewCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Views
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-center">{row.original.viewCount}</div>;
    },
  },
  {
    accessorKey: "comments",
    header: "Comments",
    cell: ({ row }) => {
      return <div className="text-center">{row.original.comments?.length}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div>{format(new Date(row.original.createdAt), "MMM dd, yyyy")}</div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const post = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(post.id)}
            >
              Copy post ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/admin/posts/${post.id}`}>View details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit post</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
