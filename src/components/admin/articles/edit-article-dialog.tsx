"use client";

import type React from "react";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Textarea } from "src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { useAdmin, adminActions } from "@/context/admin-context";
import { Loader2, Upload } from "lucide-react";

// Article categories
const ARTICLE_CATEGORIES = [
  "EDUCATION",
  "TECHNOLOGY",
  "SCIENCE",
  "LITERATURE",
  "HISTORY",
  "ARTS",
  "HEALTH",
  "SPORTS",
  "OTHER",
];

interface Article {
  id: string;
  title: string;
  abstract: string | null;
  content: string;
  category: string | null;
  imageUrl: string | null;
}

interface EditArticleDialogProps {
  article: Article;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditArticleDialog({
  article,
  open,
  onOpenChange,
  onSuccess,
}: EditArticleDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    content: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { dispatch } = useAdmin();

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        abstract: article.abstract || "",
        content: article.content,
        category: article.category || "",
      });
    }
  }, [article]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    adminActions.setLoading(dispatch, true);

    try {
      // In a real implementation, you would upload the image file
      // and get the URL to include in the article data
      let imageUrl = article.imageUrl;
      if (imageFile) {
        // Simulate image upload
        imageUrl = `/articles/images/${Date.now()}-${imageFile.name}`;
      }

      const articleData = {
        ...formData,
        imageUrl,
      };

      const response = await axios.put(
        `/api/admin/articles/${article.id}`,
        articleData
      );

      onSuccess();
    } catch (error: any) {
      console.error("Error updating article:", error);

      if (error.response?.data?.error) {
        adminActions.addAlert(dispatch, error.response.data.error, "error");
      } else {
        adminActions.addAlert(dispatch, "Failed to update article", "error");
      }
    } finally {
      setIsSubmitting(false);
      adminActions.setLoading(dispatch, false);
    }
  };

  // Format category for display
  const formatCategory = (category: string) => {
    return category.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Article</DialogTitle>
          <DialogDescription>
            Update article information and content.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title*</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-abstract">Abstract</Label>
              <Textarea
                id="edit-abstract"
                name="abstract"
                value={formData.abstract}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-content">Content*</Label>
              <Textarea
                id="edit-content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={10}
                className={errors.content ? "border-red-500" : ""}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {formatCategory(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-image">Featured Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("edit-image")?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {imageFile ? imageFile.name : "Replace image"}
                </Button>
              </div>
              {article.imageUrl && !imageFile && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>Current image:</span>
                  <img
                    src={article.imageUrl || "/placeholder.svg"}
                    alt="Current"
                    className="h-8 w-8 object-cover rounded"
                  />
                  <span>{article.imageUrl.split("/").pop()}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
