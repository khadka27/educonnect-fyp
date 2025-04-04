"use client";

import type React from "react";

import { useState } from "react";
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

// Book categories
const BOOK_CATEGORIES = [
  "FICTION",
  "NON_FICTION",
  "SCIENCE",
  "TECHNOLOGY",
  "HISTORY",
  "BIOGRAPHY",
  "SELF_HELP",
  "EDUCATION",
  "REFERENCE",
];

interface CreateBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateBookDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateBookDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    isbn: "",
    category: "",
    publishedYear: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { dispatch } = useAdmin();

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

  const handleBookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBookFile(e.target.files[0]);
      if (errors.bookFile) {
        setErrors((prev) => ({ ...prev, bookFile: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author is required";
    }

    if (formData.publishedYear) {
      const year = Number.parseInt(formData.publishedYear);
      if (isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
        newErrors.publishedYear = "Invalid year";
      }
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
      // Create FormData for file upload
      const submitData = new FormData();

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });

      // Add files if present
      if (imageFile) submitData.append("image", imageFile);
      if (bookFile) submitData.append("bookFile", bookFile);

      const response = await axios.post("/api/admin/books", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset form
      setFormData({
        title: "",
        author: "",
        description: "",
        isbn: "",
        category: "",
        publishedYear: "",
      });
      setImageFile(null);
      setBookFile(null);

      onSuccess();
    } catch (error: any) {
      console.error("Error creating book:", error);

      if (error.response?.data?.error) {
        adminActions.addAlert(dispatch, error.response.data.error, "error");
      } else {
        adminActions.addAlert(dispatch, "Failed to create book", "error");
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>
            Add a new book to the library. Fill in the details and upload files.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title*</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Book title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="author">Author*</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Author name"
                  className={errors.author ? "border-red-500" : ""}
                />
                {errors.author && (
                  <p className="text-sm text-red-500">{errors.author}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Book description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  placeholder="ISBN number"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="publishedYear">Published Year</Label>
                <Input
                  id="publishedYear"
                  name="publishedYear"
                  value={formData.publishedYear}
                  onChange={handleChange}
                  placeholder="YYYY"
                  className={errors.publishedYear ? "border-red-500" : ""}
                />
                {errors.publishedYear && (
                  <p className="text-sm text-red-500">{errors.publishedYear}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {BOOK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {formatCategory(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="image">Cover Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {imageFile ? imageFile.name : "Choose file"}
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bookFile">Book File (PDF)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="bookFile"
                    type="file"
                    accept=".pdf,.epub,.mobi"
                    onChange={handleBookFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("bookFile")?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {bookFile ? bookFile.name : "Choose file"}
                  </Button>
                </div>
              </div>
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
              Add Book
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
