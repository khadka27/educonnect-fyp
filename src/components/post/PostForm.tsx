"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Image as ImageIcon,
  FileIcon,
  X,
  Loader,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

interface FileWithPreview extends File {
  preview: string;
}

export default function EnhancedPostBox({
  onAddPost,
}: {
  onAddPost: (post: any) => void;
}) {
  const [postContent, setPostContent] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (session) {
      fetchUserData();
    }
  }, [session]);

  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      dropZone.addEventListener("dragenter", handleDragEnter);
      dropZone.addEventListener("dragleave", handleDragLeave);
      dropZone.addEventListener("dragover", handleDragOver);
      dropZone.addEventListener("drop", handleDrop);

      return () => {
        dropZone.removeEventListener("dragenter", handleDragEnter);
        dropZone.removeEventListener("dragleave", handleDragLeave);
        dropZone.removeEventListener("dragover", handleDragOver);
        dropZone.removeEventListener("drop", handleDrop);
      };
    }
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/user/${session?.user.id}`);
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostContent(e.target.value);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const filesWithPreviews = newFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setFiles((prevFiles) => [...prevFiles, ...filesWithPreviews]);
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", postContent);
      files.forEach((file) => formData.append("files", file));

      await axios.post("/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${session.user.id}`,
        },
      });
      const newPost = {
        content: postContent,
        files: files,
        user: user,
        createdAt: new Date().toISOString(),
      };

      onAddPost(newPost);

      toast({
        title: "Success",
        description: "Post created successfully!",
      });

      setPostContent("");
      setFiles([]);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "There was an error creating your post.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshContent = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get("/api/refresh-content");
      setPostContent(response.data.content);
      toast({
        title: "Content Refreshed",
        description: "Your post content has been updated with new ideas!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const isPostButtonEnabled = postContent.trim().length > 0 || files.length > 0;

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-[25%] pt-14 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl">
     
      <div
        ref={dropZoneRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl ${
          isDragging ? "border-2 border-dashed border-green-500" : ""
        }`}
      >
        <div className="flex items-start space-x-3 sm:space-x-4 mb-4 sm:mb-6">
          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-green-400">
            <AvatarImage
              src={user?.profileImage || "/default-profile.png"}
              alt={user?.name || "User"}
            />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-200">
              {user?.name || "User"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {user?.username || "@username"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {format(new Date(), "MMMM d, yyyy HH:mm")}
            </p>
          </div>
        </div>
        <div className="relative">
          <Textarea
            placeholder="What's on your mind?"
            value={postContent}
            onChange={handleContentChange}
            className="w-full min-h-[120px] sm:min-h-[150px] resize-none border-2 border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-400 text-base sm:text-lg mb-4 bg-green-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg transition-all duration-300"
          />
          <Button
            onClick={refreshContent}
            className="absolute top-2 right-2 bg-green-100 hover:bg-green-200 text-green-600 p-1 sm:p-2 rounded-full transition-all duration-300"
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </Button>
        </div>
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-green-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300 hover:shadow-md">
                  {file.type.startsWith("image/") ? (
                    <Image
                      src={file.preview}
                      alt={file.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-300" />
                  )}
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 sm:w-10 sm:h-10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-gray-700 transition-all duration-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="sr-only">Add File</span>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              hidden
              multiple
            />
          </div>
          <Button
            onClick={handlePost}
            className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            disabled={!isPostButtonEnabled || loading}
          >
            {loading ? (
              <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
