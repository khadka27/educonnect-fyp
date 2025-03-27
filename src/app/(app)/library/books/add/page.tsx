"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  UploadIcon as FileUpload,
  Upload,
  FileIcon as FilePdf,
  ImageIcon,
  Loader2,
  BookOpen,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "src/components/ui/input";
import { Textarea } from "src/components/ui/textarea";
import { Label } from "src/components/ui/label";
import { Card, CardContent } from "src/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function AddBookPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    description: "",
    isbn: "",
    category: "",
    publishedYear: "",
    imageUrl: "",
    fileUrl: "",
  });

  // File states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  // Use useEffect for redirects
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [router, status]);

  // Show loading if session is loading or we're about to redirect
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900 flex items-center justify-center">
        <div className="flex flex-col items-center p-8 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
          <Loader2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 animate-spin mb-4" />
          <p className="text-emerald-800 dark:text-emerald-200 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setBookData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const uploadPdf = async (file: File) => {
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "book");

      const response = await fetch("/api/upload/pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("PDF upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw error;
    } finally {
      setUploadingPdf(false);
    }
  };

  const uploadCoverImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading cover image:", error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Upload files if provided
      let fileUrl = bookData.fileUrl;
      let imageUrl = bookData.imageUrl;

      if (pdfFile) {
        fileUrl = await uploadPdf(pdfFile);
      }

      if (coverImage) {
        imageUrl = await uploadCoverImage(coverImage);
      }

      // Create book record in database
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookData,
          fileUrl,
          imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create book");
      }

      toast({
        title: "Success!",
        description: "Your book has been added successfully.",
      });

      router.push("/library/books");
      router.refresh();
    } catch (error) {
      console.error("Error adding book:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add book. Please try again."
      );
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-900 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center text-emerald-800 dark:text-emerald-200">
          <BookOpen className="mr-3 h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          Add New Book
        </h1>

        {error && (
          <Alert
            variant="destructive"
            className="mb-6 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-white/90 dark:bg-gray-800/90 shadow-lg border-emerald-100 dark:border-emerald-900/50 overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title & Author */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-emerald-800 dark:text-emerald-200"
                  >
                    Title <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={bookData.title}
                    onChange={handleChange}
                    className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
                    placeholder="Enter book title"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="author"
                    className="text-emerald-800 dark:text-emerald-200"
                  >
                    Author <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="author"
                    name="author"
                    required
                    value={bookData.author}
                    onChange={handleChange}
                    className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
                    placeholder="Enter author name"
                  />
                </div>
              </div>

              {/* ISBN & Published Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="isbn"
                    className="text-emerald-800 dark:text-emerald-200"
                  >
                    ISBN
                  </Label>
                  <Input
                    type="text"
                    id="isbn"
                    name="isbn"
                    value={bookData.isbn}
                    onChange={handleChange}
                    className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
                    placeholder="e.g., 978-3-16-148410-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="publishedYear"
                    className="text-emerald-800 dark:text-emerald-200"
                  >
                    Published Year
                  </Label>
                  <Input
                    type="number"
                    id="publishedYear"
                    name="publishedYear"
                    value={bookData.publishedYear}
                    onChange={handleChange}
                    className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
                    min="1800"
                    max={new Date().getFullYear()}
                    placeholder={new Date().getFullYear().toString()}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-emerald-800 dark:text-emerald-200"
                >
                  Category
                </Label>
                <Input
                  type="text"
                  id="category"
                  name="category"
                  value={bookData.category}
                  onChange={handleChange}
                  className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
                  placeholder="e.g., Fiction, Science, History"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-emerald-800 dark:text-emerald-200"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={bookData.description}
                  onChange={handleChange}
                  className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500 min-h-[120px]"
                  placeholder="Book description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PDF Upload */}
                <div className="space-y-2">
                  <Label
                    htmlFor="pdfFile"
                    className="text-emerald-800 dark:text-emerald-200"
                  >
                    PDF File
                  </Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 transition-colors hover:border-emerald-300 dark:hover:border-emerald-700 h-full">
                    {pdfFile ? (
                      <div className="flex flex-col items-center">
                        <FilePdf
                          size={48}
                          className="text-rose-500 dark:text-rose-400 mb-3"
                        />
                        <p className="text-sm font-medium mb-3 text-emerald-800 dark:text-emerald-200 text-center">
                          {pdfFile.name}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPdfFile(null)}
                            className="text-rose-600 hover:text-rose-700 border-rose-200 hover:border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:border-rose-800 dark:hover:border-rose-700 dark:hover:bg-rose-900/20"
                          >
                            <X className="mr-1 h-4 w-4" />
                            Remove
                          </Button>
                          <label
                            htmlFor="pdfFile"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20"
                          >
                            <FileUpload className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            Change PDF
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileUpload
                          size={48}
                          className="text-emerald-400 dark:text-emerald-600 mb-3"
                        />
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-3 text-center">
                          Upload a PDF file of the book
                        </p>
                        <label
                          htmlFor="pdfFile"
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                        >
                          {uploadingPdf ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Select PDF
                        </label>
                      </div>
                    )}
                    <input
                      id="pdfFile"
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handlePdfFileChange}
                    />
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <Label
                    htmlFor="coverImage"
                    className="text-emerald-800 dark:text-emerald-200"
                  >
                    Cover Image
                  </Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 transition-colors hover:border-emerald-300 dark:hover:border-emerald-700 h-full">
                    {coverImage ? (
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-40 bg-white dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden mb-3 shadow-md">
                          <img
                            src={
                              URL.createObjectURL(coverImage) ||
                              "/placeholder.svg"
                            }
                            alt="Cover preview"
                            className="max-w-full max-h-full object-cover"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCoverImage(null)}
                            className="text-rose-600 hover:text-rose-700 border-rose-200 hover:border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:border-rose-800 dark:hover:border-rose-700 dark:hover:bg-rose-900/20"
                          >
                            <X className="mr-1 h-4 w-4" />
                            Remove
                          </Button>
                          <label
                            htmlFor="coverImage"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20"
                          >
                            <ImageIcon className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            Change Image
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon
                          size={48}
                          className="text-emerald-400 dark:text-emerald-600 mb-3"
                        />
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-3 text-center">
                          Upload a cover image for the book
                        </p>
                        <label
                          htmlFor="coverImage"
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                        >
                          {uploadingImage ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <ImageIcon className="mr-2 h-4 w-4" />
                          )}
                          Select Image
                        </label>
                      </div>
                    )}
                    <input
                      id="coverImage"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
                  disabled={isLoading || uploadingPdf || uploadingImage}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Save Book
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
