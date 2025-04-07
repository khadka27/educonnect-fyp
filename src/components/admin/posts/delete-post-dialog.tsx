"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface Post {
  id: string;
  content: string;
  user: {
    name: string;
    username: string;
  };
  _count?: {
    comments: number;
    reactions: number;
  };
}

interface DeletePostDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeletePostDialog({
  post,
  open,
  onOpenChange,
  onSuccess,
}: DeletePostDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // The actual delete operation is handled in the parent component
      onSuccess();
    } catch (error) {
      console.error("Error in delete dialog:", error);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if post has comments or reactions
  const hasComments = post._count && post._count.comments > 0;
  const hasReactions = post._count && post._count.reactions > 0;

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this post by {post.user.name} (@
            {post.user.username}).
            <div className="mt-2 p-2 bg-muted rounded-md">
              <p className="italic">{truncateText(post.content, 150)}</p>
            </div>
            {(hasComments || hasReactions) && (
              <div className="mt-2 rounded-md bg-amber-50 p-2 text-amber-800">
                <p className="font-medium">Warning:</p>
                <ul className="ml-4 list-disc">
                  {hasComments && (
                    <li>
                      This post has {post._count?.comments} comments that will
                      be deleted.
                    </li>
                  )}
                  {hasReactions && (
                    <li>
                      This post has {post._count?.reactions} reactions that will
                      be deleted.
                    </li>
                  )}
                </ul>
              </div>
            )}
            <p className="mt-2">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
