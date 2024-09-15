/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Image as IMAGE, FileIcon, X, Upload, Loader } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

interface FileWithPreview extends File {
  preview: string;
}

export default function EnhancedPostBox({ onAddPost }: any) {
  const [postContent, setPostContent] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { data: session } = useSession(); // Use session data for user info
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Fetch user data from session
  useEffect(() => {
    if (session) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/user/${session?.user.id}`);
      setUser(response.data);

      setLoading(false);
    } catch (error) {
      setError("Failed to load user data");
      setLoading(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostContent(e.target.value);
  };

  //   const handleEmojiClick = (emojiObject: any) => {
  //     setPostContent((prevContent) => prevContent + emojiObject.emoji);
  //   };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
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
        color: "red",
        variant: "destructive",
      });
      return;
    }

    setLoading(true); // Start loading state

    try {
      const formData = new FormData();
      formData.append("content", postContent);
      files.forEach((file) => formData.append("files", file));

      await axios.post("/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${session.user.id}`, // Pass the token if needed
        },
      });
      const newPost = {
        content: postContent,
        files: files,
        user: user,
        createdAt: new Date().toISOString(),
      };
      onAddPost(newPost); // Pass the new post to the parent component

      toast({
        title: "Success",
        description: "Post created successfully!",
        color: "green",
        variant: "default",
      });

      // Clear the form after successful post
      setPostContent(""); // Clear post content
      setFiles([]); // Clear uploaded files
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "There was an error creating your post.",
        color: "red",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // End loading state
    }
  };

  const isPostButtonEnabled = postContent.trim().length > 0 || files.length > 0;

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-[15%] xl:px-[25%] py-8 bg-green-100 dark:bg-gray-900 ">
      <h1 className="text-green-100 dark:text-gray-900 mb-10">post page</h1>
      <div className="bg-green-400 dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 w-full">
        <div className="bg-green-300 dark:bg-gray-700 rounded-lg p-4 sm:p-6 shadow-inner">
          <div className="flex items-start space-x-4 mb-4">
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
              <AvatarImage
                src={user?.profileImage || "/default-profile.png"}
                alt="USER"
              />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-200">
                {user?.name?.charAt(0) || "U"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {user?.username || "username"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {format(new Date(), "MMMM d, yyyy HH:mm")}
              </p>
            </div>
          </div>
          <Textarea
            placeholder="What's on your mind?"
            value={postContent}
            onChange={handleContentChange}
            className="w-full min-h-[100px] sm:min-h-[150px] resize-none border-none focus:ring-0 text-base sm:text-lg mb-4 bg-green-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <div
            // dangerouslySetInnerHTML={{ __html: postContent }}
            className="mb-4 text-sm sm:text-base text-gray-800 dark:text-gray-200"
          />
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-green-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                    {file.type.startsWith("image/") ? (
                      <Image
                        src={file.preview}
                        alt={file.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-300" />
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center flex-wrap gap-2 sm:gap-4">
            <div className="flex space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 dark:text-gray-300 hover:bg-green-200 dark:hover:bg-gray-600 group relative"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <IMAGE className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="sr-only">Add Media</span>
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Add Media
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Media</DialogTitle>
                  </DialogHeader>
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:bg-green-200 dark:hover:bg-gray-700"
                    onDrop={handleFileDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInput}
                      hidden
                      multiple
                    />
                    <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-4" />
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Drag and drop files here, or click to select files
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Button
              onClick={handlePost}
              className="flex items-center space-x-2"
              disabled={!isPostButtonEnabled || loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
