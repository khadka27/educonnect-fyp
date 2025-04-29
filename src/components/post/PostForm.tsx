"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "src/components/ui/button";
import { Textarea } from "src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import {
  ImageIcon,
  FileIcon,
  X,
  Loader,
  RefreshCw,
  Smile,
  MapPin,
  Tag,
  Camera,
  Video,
  Paperclip,
  AlertCircle,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "src/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "src/components/ui/tabs";
import { Progress } from "src/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";

interface FileWithPreview extends File {
  preview: string;
  uploading?: boolean;
  progress?: number;
  error?: boolean;
}

export default function EnhancedPostBox({
  onAddPost,
}: {
  onAddPost: (post: any) => void;
}) {
  const [postContent, setPostContent] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [mood, setMood] = useState("");
  const [activeTab, setActiveTab] = useState("text");
  const [isExpanded, setIsExpanded] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const MAX_CHAR_COUNT = 500;
  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    setCharacterCount(postContent.length);
  }, [postContent]);

  useEffect(() => {
    if (session) {
      fetchUserData();
    } else {
      setIsLoadingUser(false);
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
    setIsLoadingUser(true);
    try {
      const response = await axios.get(`/api/user/${session?.user.id}`);
      setUser(response.data);
      setIsLoadingUser(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
      setIsLoadingUser(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHAR_COUNT) {
      setPostContent(value);
    }
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

  const handleVideoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const videoFiles = selectedFiles.filter((file) =>
        file.type.startsWith("video/")
      );
      addFiles(videoFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    // Check if adding these files would exceed the limit
    if (files.length + newFiles.length > MAX_FILES) {
      toast({
        title: "File limit exceeded",
        description: `You can only upload up to ${MAX_FILES} files per post.`,
        variant: "destructive",
      });

      // Only add files up to the limit
      newFiles = newFiles.slice(0, MAX_FILES - files.length);
      if (newFiles.length === 0) return;
    }

    // Filter out files that are too large
    const validFiles: File[] = [];
    const oversizedFiles: File[] = [];

    newFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file);
      } else {
        validFiles.push(file);
      }
    });

    if (oversizedFiles.length > 0) {
      toast({
        title: "Files too large",
        description: `${oversizedFiles.length} file(s) exceed the 10MB limit and were not added.`,
        variant: "destructive",
      });
    }

    if (validFiles.length === 0) return;

    const filesWithPreviews = validFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        uploading: false,
        progress: 0,
        error: false,
      })
    );

    setFiles((prevFiles) => [...prevFiles, ...filesWithPreviews]);

    // Switch to media tab when files are added
    setActiveTab("media");
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handlePost = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a post.",
        variant: "destructive",
      });
      return;
    }

    if (!postContent.trim() && files.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some content or media to your post.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate file upload progress
      if (files.length > 0) {
        setFiles((prevFiles) =>
          prevFiles.map((file) => ({
            ...file,
            uploading: true,
            progress: 0,
          }))
        );

        // Simulate progress updates
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setFiles((prevFiles) =>
            prevFiles.map((file) => ({
              ...file,
              progress: Math.min(progress, 100),
            }))
          );

          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 300);
      }

      const formData = new FormData();
      formData.append("content", postContent);

      if (location) formData.append("location", location);
      if (tags.length > 0) formData.append("tags", JSON.stringify(tags));
      if (mood) formData.append("mood", mood);

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
        location: location || undefined,
        tags: tags.length > 0 ? tags : undefined,
        mood: mood || undefined,
      };

      onAddPost(newPost);

      toast({
        title: "Post created",
        description: "Your post has been published successfully!",
      });

      // Reset form
      setPostContent("");
      setFiles([]);
      setLocation("");
      setTags([]);
      setCurrentTag("");
      setMood("");
      setActiveTab("text");
      setIsExpanded(false);

      // Clean up file previews
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    } catch (error) {
      console.error("Error creating post:", error);

      // Mark files as error
      setFiles((prevFiles) =>
        prevFiles.map((file) => ({
          ...file,
          uploading: false,
          error: true,
        }))
      );

      toast({
        title: "Error",
        description: "There was an error creating your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshContent = async () => {
    setRefreshing(true);
    try {
      // Try to get content from API
      try {
        const response = await axios.get("/api/refresh-content");
        setPostContent(response.data.content);
      } catch (apiError) {
        // Fallback to local suggestions if API fails
        const suggestions = [
          "Just finished an amazing coding session! #WebDev #JavaScript",
          "Excited to share my latest project with everyone! Check it out 🚀",
          "Learning something new every day. Today's focus: React hooks!",
          "Beautiful day for a walk and some creative thinking ☀️",
          "Working on a new feature for my app. Can't wait to share the results!",
        ];
        setPostContent(
          suggestions[Math.floor(Math.random() * suggestions.length)]
        );
      }

      toast({
        title: "Content refreshed",
        description: "New post idea generated!",
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

  const addEmoji = (emoji: string) => {
    setPostContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      setLocation("Detecting location...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Use OpenStreetMap Nominatim API for reverse geocoding (free and no API key required)
            const { latitude, longitude } = position.coords;
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  "Accept-Language": "en", // Ensure we get English results
                  "User-Agent": "EduConnect App", // Required by Nominatim usage policy
                },
              }
            );

            // Format the location data
            const addressData = response.data;
            let locationString;

            if (addressData.address) {
              // Create a user-friendly location string based on available data
              const city =
                addressData.address.city ||
                addressData.address.town ||
                addressData.address.village ||
                addressData.address.county;

              const state = addressData.address.state;
              const country = addressData.address.country;

              if (city && state) {
                locationString = `${city}, ${state}`;
              } else if (city) {
                locationString = city;
              } else if (state) {
                locationString = state;
              } else if (country) {
                locationString = country;
              } else {
                locationString = addressData.display_name
                  .split(",")
                  .slice(0, 2)
                  .join(",");
              }
            } else {
              // Fallback if structured address data is not available
              locationString =
                addressData.display_name?.split(",").slice(0, 2).join(",") ||
                "Unknown location";
            }

            setLocation(locationString);
            toast({
              title: "Location detected",
              description: "Your current location has been added to the post.",
              variant: "default",
              className: "bg-green-50 border-green-200 text-green-800",
            });
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            setLocation("");
            toast({
              title: "Location error",
              description:
                "Unable to determine your location name. Please try again or enter manually.",
              variant: "destructive",
            });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocation("");
          toast({
            title: "Location error",
            description:
              "Unable to detect your location. Please try again or check your browser permissions.",
            variant: "destructive",
          });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
      if (tagInputRef.current) {
        tagInputRef.current.focus();
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const setMoodEmoji = (emoji: string) => {
    setMood(emoji);
    toast({
      title: "Mood set",
      description: `Your mood has been set to ${emoji}`,
    });
  };

  const isPostButtonEnabled =
    (postContent.trim().length > 0 || files.length > 0) && !loading;

  // Common emoji sets for mood selection
  const moodEmojis = [
    "😊",
    "😍",
    "🥳",
    "😎",
    "🤔",
    "😢",
    "😡",
    "😴",
    "🤒",
    "🥰",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sm:px-6 md:px-8 pt-6 transition-all duration-300"
    >
      <div
        ref={dropZoneRef}
        className={cn(
          "bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700",
          isDragging &&
            "border-2 border-dashed border-green-500 bg-green-50 dark:bg-gray-700 scale-[1.01] transform duration-300"
        )}
      >
        {/* User info section */}
        <div className="flex items-start space-x-3 sm:space-x-4 mb-4 sm:mb-6">
          {isLoadingUser ? (
            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
          ) : (
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-green-400 ring-2 ring-green-100 dark:ring-green-900 transition-all duration-300 hover:scale-105">
              <AvatarImage
                src={
                  user?.profileImage || "/placeholder.svg?height=40&width=40"
                }
                alt={user?.name || "User"}
              />
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-600 text-white font-semibold">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-grow">
            {isLoadingUser ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-200">
                  {user?.name || "User"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {user?.username || "@username"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {format(new Date(), "MMMM d, yyyy HH:mm")}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Tabs for different content types */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="text" className="flex items-center gap-1">
              <span className="hidden sm:inline">Text</span>
              <span className="sm:hidden">📝</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-1">
              <span className="hidden sm:inline">Media</span>
              <span className="sm:hidden">🖼️</span>
            </TabsTrigger>
            <TabsTrigger value="extras" className="flex items-center gap-1">
              <span className="hidden sm:inline">Extras</span>
              <span className="sm:hidden">✨</span>
            </TabsTrigger>
          </TabsList>

          {/* Text tab content */}
          <div className={activeTab === "text" ? "block" : "hidden"}>
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="What's on your mind?"
                value={postContent}
                onChange={handleContentChange}
                className="w-full min-h-[120px] resize-none border-2 border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-400 text-base sm:text-lg mb-2 bg-green-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg transition-all duration-300"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={refreshContent}
                      className="absolute top-2 right-2 bg-green-100 hover:bg-green-200 text-green-600 p-1 sm:p-2 rounded-full transition-all duration-300"
                      disabled={refreshing}
                      size="icon"
                    >
                      <RefreshCw
                        className={cn(
                          "w-4 h-4 sm:w-5 sm:h-5",
                          refreshing && "animate-spin"
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get content suggestions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center">
                <span
                  className={
                    characterCount > MAX_CHAR_COUNT * 0.8
                      ? "text-amber-500"
                      : ""
                  }
                >
                  {characterCount}
                </span>
                <span>/</span>
                <span>{MAX_CHAR_COUNT}</span>
              </div>

              <Progress
                value={(characterCount / MAX_CHAR_COUNT) * 100}
                className={cn(
                  "w-24 h-1",
                  characterCount > MAX_CHAR_COUNT * 0.9
                    ? "bg-red-500"
                    : characterCount > MAX_CHAR_COUNT * 0.8
                    ? "bg-amber-500"
                    : "bg-green-500"
                )}
              />
              <Progress
                value={(characterCount / MAX_CHAR_COUNT) * 100}
                className={cn(
                  "w-24 h-1",
                  characterCount > MAX_CHAR_COUNT * 0.9
                    ? "bg-red-500"
                    : characterCount > MAX_CHAR_COUNT * 0.8
                    ? "bg-amber-500"
                    : "bg-green-500"
                )}
              />
            </div>
          </div>

          {/* Media tab content */}
          <div className={activeTab === "media" ? "block" : "hidden"}>
            <AnimatePresence>
              {files.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4"
                >
                  {files.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group"
                    >
                      <div className="aspect-square bg-green-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300 hover:shadow-md">
                        {file.type?.startsWith("image/") ? (
                          <Image
                            src={file.preview || "/placeholder.svg"}
                            alt={file.name}
                            width={200}
                            height={200}
                            className={cn(
                              "w-full h-full object-cover",
                              file.error && "opacity-50"
                            )}
                          />
                        ) : file.type?.startsWith("video/") ? (
                          <video
                            src={file.preview}
                            className={cn(
                              "w-full h-full object-cover",
                              file.error && "opacity-50"
                            )}
                            muted
                          />
                        ) : (
                          <FileIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-300" />
                        )}

                        {file.uploading && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-3/4 bg-white rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-green-500 h-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {file.error && (
                          <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                            <AlertCircle className="text-red-500 w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-2 border-dashed border-green-200 dark:border-gray-600 rounded-lg p-8 mb-4 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-3 bg-green-100 dark:bg-gray-700 rounded-full">
                      <ImageIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-gray-700 dark:text-gray-300 font-medium">
                      Add media to your post
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                      Drag and drop files here or click the buttons below to
                      upload
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 border-green-300 text-green-600"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="w-4 h-4" />
                        <span>Photos</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 border-green-300 text-green-600"
                        onClick={() => videoInputRef.current?.click()}
                      >
                        <Video className="w-4 h-4" />
                        <span>Videos</span>
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                      Supported formats: JPG, PNG, GIF, MP4, MOV (max 10MB)
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-green-300 text-green-600"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Add Photos</span>
                <span className="sm:hidden">Photos</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-green-300 text-green-600"
                onClick={() => videoInputRef.current?.click()}
              >
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Add Videos</span>
                <span className="sm:hidden">Videos</span>
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                hidden
                multiple
                accept="image/*"
              />
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoInput}
                hidden
                multiple
                accept="video/*"
              />
            </div>
          </div>

          {/* Extras tab content */}
          <div className={activeTab === "extras" ? "block" : "hidden"}>
            <div className="space-y-4">
              {/* Location */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <div className="flex items-center gap-2">
                  {location ? (
                    <div className="flex items-center bg-green-100 dark:bg-gray-700 px-3 py-1.5 rounded-full text-sm text-green-700 dark:text-green-300">
                      <MapPin className="w-4 h-4 mr-1" />
                      {location}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-5 h-5 ml-1 text-green-600"
                        onClick={() => setLocation("")}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 border-green-300 text-green-600"
                      onClick={detectLocation}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Add Location</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-green-100 dark:bg-gray-700 px-3 py-1.5 rounded-full text-sm text-green-700 dark:text-green-300"
                    >
                      #{tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-5 h-5 ml-1 text-green-600"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-1.5 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 border-green-300 text-green-600"
                    onClick={addTag}
                    disabled={!currentTag.trim()}
                  >
                    <Tag className="w-4 h-4" />
                    <span>Add</span>
                  </Button>
                </div>
              </div>

              {/* Mood */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mood
                </label>
                <div className="flex flex-wrap gap-2">
                  {mood ? (
                    <div className="flex items-center bg-green-100 dark:bg-gray-700 px-3 py-1.5 rounded-full text-sm text-green-700 dark:text-green-300">
                      {mood}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-5 h-5 ml-1 text-green-600"
                        onClick={() => setMood("")}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {moodEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => setMoodEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-green-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Emoji picker button */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Emojis
                </label>
                <Popover
                  open={showEmojiPicker}
                  onOpenChange={setShowEmojiPicker}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 border-green-300 text-green-600 w-fit"
                    >
                      <Smile className="w-4 h-4" />
                      <span>Add Emoji</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2">
                    <div className="grid grid-cols-8 gap-1">
                      {[
                        "😀",
                        "😃",
                        "😄",
                        "😁",
                        "😆",
                        "😅",
                        "😂",
                        "🤣",
                        "😊",
                        "😇",
                        "🙂",
                        "🙃",
                        "😉",
                        "😌",
                        "😍",
                        "🥰",
                        "😘",
                        "😗",
                        "😙",
                        "😚",
                        "😋",
                        "😛",
                        "😝",
                        "😜",
                        "🤪",
                        "🤨",
                        "🧐",
                        "🤓",
                        "😎",
                        "🤩",
                        "🥳",
                        "😏",
                        "😒",
                      ].map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => addEmoji(emoji)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-green-100 dark:hover:bg-gray-700 rounded transition-colors text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </Tabs>

        {/* Post button and controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-9 h-9 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-gray-700 transition-all duration-300"
                    onClick={() => setActiveTab("media")}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add media</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-9 h-9 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-gray-700 transition-all duration-300"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add emoji</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-9 h-9 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-gray-700 transition-all duration-300"
                    onClick={() => setActiveTab("extras")}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add extras</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-9 h-9 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-gray-700 transition-all duration-300"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Post tips</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            onClick={handlePost}
            className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
            disabled={!isPostButtonEnabled}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Posting...</span>
              </div>
            ) : (
              "Post"
            )}
          </Button>
        </div>

        {/* Post tips */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 bg-green-50 dark:bg-gray-700 p-3 rounded-lg text-sm"
            >
              <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">
                Tips for a great post:
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                <li>Add images or videos to make your post more engaging</li>
                <li>Use hashtags to help others discover your content</li>
                <li>Keep your post concise and to the point</li>
                <li>Add your location to connect with people nearby</li>
                <li>Express your mood to add context to your post</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
