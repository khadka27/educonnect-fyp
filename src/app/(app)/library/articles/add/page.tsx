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
  FileText,
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

export default function AddArticlePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [articleData, setArticleData] = useState({
    title: "",
    abstract: "",
    content: "",
    category: "",
    imageUrl: "",
    fileUrl: "",
  });

  // File states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);

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
    setArticleData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFeaturedImage(e.target.files[0]);
    }
  };

  const uploadPdf = async (file: File) => {
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "article");

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

  const uploadImage = async (file: File) => {
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
      console.error("Error uploading image:", error);
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
      let fileUrl = articleData.fileUrl;
      let imageUrl = articleData.imageUrl;

      if (pdfFile) {
        fileUrl = await uploadPdf(pdfFile);
      }

      if (featuredImage) {
        imageUrl = await uploadImage(featuredImage);
      }

      // Create article record in database
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...articleData,
          fileUrl,
          imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create article");
      }

      toast({
        title: "Success!",
        description: "Your article has been published successfully.",
      });

      router.push("/library/articles");
      router.refresh();
    } catch (error) {
      console.error("Error adding article:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add article. Please try again."
      );
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add article. Please try again.",
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
          <FileText className="mr-3 h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          Write New Article
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
              {/* Title */}
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
                  value={articleData.title}
                  onChange={handleChange}
                  className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
                  placeholder="Enter article title"
                />
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
                  value={articleData.category}
                  onChange={handleChange}
                  className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
                  placeholder="e.g., Science, Literature, History"
                />
              </div>

              {/* Abstract */}
              <div className="space-y-2">
                <Label
                  htmlFor="abstract"
                  className="text-emerald-800 dark:text-emerald-200"
                >
                  Abstract
                </Label>
                <Textarea
                  id="abstract"
                  name="abstract"
                  rows={3}
                  value={articleData.abstract}
                  onChange={handleChange}
                  className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500 resize-none"
                  placeholder="A brief summary of the article"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label
                  htmlFor="content"
                  className="text-emerald-800 dark:text-emerald-200"
                >
                  Content <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  rows={12}
                  required
                  value={articleData.content}
                  onChange={handleChange}
                  className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500 min-h-[300px]"
                  placeholder="Write your article content here..."
                />
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                  You can use Markdown for formatting.
                </p>
              </div>

              {/* Featured Image Upload */}
              <div className="space-y-2">
                <Label
                  htmlFor="featuredImage"
                  className="text-emerald-800 dark:text-emerald-200"
                >
                  Featured Image
                </Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 transition-colors hover:border-emerald-300 dark:hover:border-emerald-700">
                  {featuredImage ? (
                    <div className="flex flex-col items-center">
                      <div className="w-full max-w-sm h-48 bg-white dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden mb-3 shadow-md">
                        <img
                          src={
                            URL.createObjectURL(featuredImage) ||
                            "/placeholder.svg"
                          }
                          alt="Featured image preview"
                          className="max-w-full max-h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFeaturedImage(null)}
                          className="text-rose-600 hover:text-rose-700 border-rose-200 hover:border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:border-rose-800 dark:hover:border-rose-700 dark:hover:bg-rose-900/20"
                        >
                          <X className="mr-1 h-4 w-4" />
                          Remove
                        </Button>
                        <label
                          htmlFor="featuredImage"
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
                        Upload a featured image for your article
                      </p>
                      <label
                        htmlFor="featuredImage"
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
                    id="featuredImage"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* PDF Upload */}
              <div className="space-y-2">
                <Label
                  htmlFor="pdfFile"
                  className="text-emerald-800 dark:text-emerald-200"
                >
                  PDF Attachment (Optional)
                </Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 transition-colors hover:border-emerald-300 dark:hover:border-emerald-700">
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
                        Attach a PDF document to your article (optional)
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
                      Publishing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Publish Article
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
