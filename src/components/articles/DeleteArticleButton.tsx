"use client";

// src/components/articles/DeleteArticleButton.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteArticleButtonProps {
  articleId: string;
}

export function DeleteArticleButton({ articleId }: DeleteArticleButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete article");
      }

      // Redirect to articles list
      router.push("/library/articles");
      router.refresh();
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Failed to delete article. Please try again.");
      setIsDeleting(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowConfirmation(false)}
          className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Confirm"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirmation(true)}
      className="px-3 py-1 border border-red-600 text-red-600 rounded hover:bg-red-50"
    >
      Delete
    </button>
  );
}