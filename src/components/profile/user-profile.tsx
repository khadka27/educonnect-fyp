// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import { useState, useEffect, ChangeEvent } from "react";
// import { Button } from "src/components/ui/button";
// import { Card } from "src/components/ui/card";
// import { Dialog, DialogContent, DialogTrigger } from "src/components/ui/dialog";
// import { Input } from "src/components/ui/input";
// import { Textarea } from "src/components/ui/textarea";
// import {
//   MapPin,
//   MessageSquare,
//   Edit,
//   Camera,
//   Plus,
//   Upload,
//   User,
// } from "lucide-react";
// import { useTheme } from "next-themes";
// import axios from "axios";
// import EditProfile from "src/components/profile/edit-profile";
// import { useSession } from "next-auth/react";
// import Image from "next/image";
// import Avatar from "react-avatar";
// import { useToast } from "@/hooks/use-toast";
// import TimelineList from "./TimelineList";
// import EduConnectLoader from "../educonnectloader";

// interface UserProfileProps {
//   userId: string;
// }

// const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
//   const { data: session } = useSession();
//   const [user, setUser] = useState<any>(null);
//   const { theme } = useTheme();
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [postContent, setPostContent] = useState("");
//   const [postMedia, setPostMedia] = useState<File | null>(null);
//   const [mediaPreview, setMediaPreview] = useState<string | null>(null);
//   const { toast } = useToast();

//   useEffect(() => {
//     if (userId) {
//       fetchUserData();
//     }
//   }, [userId]);

//   const fetchUserData = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`/api/user/${userId}`);
//       setUser(response.data);
//       setLoading(false);
//     } catch (error) {
//       setError("Failed to load user data");
//       setLoading(false);
//     }
//   };

//   const handleProfileUpdate = async () => {
//     await fetchUserData();
//   };

//   const handlePostContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
//     setPostContent(e.target.value);
//   };

//   const handlePostMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setPostMedia(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setMediaPreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handlePostSubmit = async () => {
//     try {
//       const formData = new FormData();
//       formData.append("content", postContent);
//       if (postMedia) {
//         formData.append("media", postMedia);
//       }

//       await axios.post("/api/posts", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       toast({
//         title: "Post created",
//         description: "Your post has been successfully created.",
//       });

//       setIsAddPostModalOpen(false);
//       setPostContent("");
//       setPostMedia(null);
//       setMediaPreview(null);
//       await fetchUserData(); // Refresh the user data to include the new post
//     } catch (error) {
//       console.error("Error creating post:", error);
//       toast({
//         title: "Error",
//         description: "Failed to create post. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   if (loading)
//     return (
//       <div>
//         {" "}
//         <EduConnectLoader />{" "}
//       </div>
//     );
//   if (error) return <div>{error}</div>;

//   const isDarkMode = theme === "dark";

//   return (
//     <div
//       className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
//     >
//       <h1 className="text-3xl font-bold text-center text-green-600 dark:text-green-400 mb-7">
//         Profile
//       </h1>
//       <div className="max-w-4xl mx-auto p-4">
//         {/* Cover Image */}
//         <div className="relative h-48 md:h-64 rounded-t-lg overflow-hidden">
//           <Dialog>
//             <DialogTrigger asChild>
//               <Image
//                 src={
//                   user?.coverImage || "/placeholder.svg?height=300&width=1200"
//                 }
//                 alt="Cover"
//                 layout="fill"
//                 objectFit="cover"
//                 className="cursor-pointer"
//               />
//             </DialogTrigger>
//             <DialogContent className="max-w-3xl">
//               <Image
//                 src={
//                   user?.coverImage || "/placeholder.svg?height=300&width=1200"
//                 }
//                 alt="Cover Preview"
//                 layout="responsive"
//                 width={1600}
//                 height={900}
//                 className="w-full h-full object-cover"
//               />
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* Profile Content */}
//         <Card
//           className={`mt-[-64px] relative z-10 ${
//             isDarkMode ? "bg-gray-800" : "bg-white"
//           }`}
//         >
//           <div className="p-6">
//             {/* Profile Picture */}
//             <div className="absolute top-0 left-6 transform -translate-y-1/2">
//               <div className="relative">
//                 <Dialog>
//                   <DialogTrigger>
//                     {user?.profileImage ? (
//                       <Image
//                         src={user.profileImage}
//                         alt="Profile"
//                         width={150}
//                         height={150}
//                         className={`w-[200px] h-[200px] rounded-full border-4 cursor-pointer transition-transform duration-300 ease-in-out ${
//                           isDarkMode ? "border-gray-800" : "border-white"
//                         } hover:scale-105 object-cover`}
//                       />
//                     ) : (
//                       <Avatar
//                         name={user?.name || "User"}
//                         size="150"
//                         round={true}
//                       />
//                     )}
//                   </DialogTrigger>
//                   <DialogContent className="max-w-sm">
//                     {user?.profileImage ? (
//                       <Image
//                         src={user.profileImage}
//                         alt="Profile"
//                         width={200}
//                         height={200}
//                         className={`w-100 h-100 border-4 cursor-pointer ${
//                           isDarkMode ? "border-gray-800" : "border-white"
//                         }`}
//                       />
//                     ) : (
//                       <Avatar
//                         name={user?.name || "User"}
//                         size="150"
//                         round={true}
//                       />
//                     )}
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </div>

//             {/* User Info */}
//             <div className="mt-16 mb-6">
//               <h1
//                 className={`text-2xl font-bold ${
//                   isDarkMode ? "text-gray-100" : "text-gray-900"
//                 }`}
//               >
//                 {user?.name || user?.username}
//               </h1>
//               <p
//                 className={`text-lg ${
//                   isDarkMode ? "text-gray-300" : "text-gray-600"
//                 }`}
//               >
//                 {user?.username || "@username"}
//               </p>
//               <div
//                 className={`flex items-center mt-2 ${
//                   isDarkMode ? "text-gray-400" : "text-gray-500"
//                 }`}
//               >
//                 <MapPin className="w-4 h-4 mr-1" />
//                 <span>{user?.address || "address"}</span>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-wrap gap-4">
//               <Button
//                 className={`flex-1 ${
//                   isDarkMode
//                     ? "bg-green-600 hover:bg-green-700"
//                     : "bg-green-400 hover:bg-green-500"
//                 }`}
//               >
//                 <MessageSquare className="w-4 h-4 mr-2" />
//                 Send Message
//               </Button>
//               {session?.user?.id === user?.id && (
//                 <Dialog
//                   open={isEditModalOpen}
//                   onOpenChange={setIsEditModalOpen}
//                 >
//                   <DialogTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className={`flex-1 ${
//                         isDarkMode
//                           ? "border-gray-600 text-gray-300"
//                           : "border-gray-300 text-gray-700"
//                       }`}
//                     >
//                       <Edit className="w-4 h-4 mr-2" />
//                       Edit Profile
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="sm:max-w-[1000px]">
//                     <EditProfile
//                       user={user}
//                       onClose={() => {
//                         setIsEditModalOpen(false);
//                         handleProfileUpdate();
//                       }}
//                     />
//                   </DialogContent>
//                 </Dialog>
//               )}
//               {session?.user?.id === user?.id && (
//                 <Dialog
//                   open={isAddPostModalOpen}
//                   onOpenChange={setIsAddPostModalOpen}
//                 >
//                   <DialogTrigger asChild>
//                     <Button
//                       className={`flex-1 ${
//                         isDarkMode
//                           ? "bg-blue-600 hover:bg-blue-700"
//                           : "bg-blue-400 hover:bg-blue-500"
//                       }`}
//                     >
//                       <Plus className="w-4 h-4 mr-2" />
//                       Add Post
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="sm:max-w-[500px]">
//                     <h2 className="text-2xl font-bold mb-4">
//                       Create a New Post
//                     </h2>
//                     <Textarea
//                       placeholder="What's on your mind?"
//                       value={postContent}
//                       onChange={handlePostContentChange}
//                       className="mb-4"
//                     />
//                     <div className="mb-4">
//                       <Input
//                         type="file"
//                         accept="image/*,video/*"
//                         onChange={handlePostMediaChange}
//                         className="mb-2"
//                       />
//                       {mediaPreview && (
//                         <div className="mt-2">
//                           {postMedia?.type.startsWith("image") ? (
//                             <Image
//                               src={mediaPreview}
//                               alt="Media preview"
//                               width={200}
//                               height={200}
//                               className="object-cover rounded"
//                             />
//                           ) : (
//                             <video
//                               src={mediaPreview}
//                               controls
//                               className="w-full max-w-[200px] rounded"
//                             />
//                           )}
//                         </div>
//                       )}
//                     </div>
//                     <Button onClick={handlePostSubmit} className="w-full">
//                       <Upload className="w-4 h-4 mr-2" />
//                       Post
//                     </Button>
//                   </DialogContent>
//                 </Dialog>
//               )}
//             </div>

//             {/* Additional User Info */}
//             <div
//               className={`mt-6 ${
//                 isDarkMode ? "text-gray-300" : "text-gray-700"
//               }`}
//             >
//               <h2
//                 className={`text-xl font-semibold mb-2 ${
//                   isDarkMode ? "text-gray-100" : "text-gray-900"
//                 }`}
//               >
//                 About Me
//               </h2>
//               <p>{user?.bio || "Hello, I am a new user!"}</p>
//               <br />
//               <hr
//                 className={isDarkMode ? "border-gray-600" : "border-gray-200"}
//               />
//               <h3 className="mt-4 mb-2 font-semibold">Contact Info</h3>
//               <p
//                 className={`text-sm ${
//                   isDarkMode ? "text-gray-400" : "text-gray-600"
//                 }`}
//               >
//                 Email: {user?.email}
//               </p>
//             </div>
//           </div>
//         </Card>
//       </div>
//       <TimelineList userId={userId} />
//     </div>
//   );
// };

// export default UserProfile;
"use client";

import type React from "react";

import { useState, useEffect, type ChangeEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Image from "next/image";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "src/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "src/components/ui/dialog";
import { Textarea } from "src/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";
import { Badge } from "src/components/ui/badge";
import { Skeleton } from "src/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { useToast } from "src/hooks/use-toast";

// Components
import EditProfile from "src/components/profile/edit-profile";
import TimelineList from "src/components/profile/TimelineList";
import SavedPostsList from "src/components/profile/saved-posts-list";

// Icons
import {
  MapPin,
  MessageSquare,
  Edit,
  Camera,
  Plus,
  User,
  Calendar,
  Mail,
  Phone,
  Share2,
  MoreHorizontal,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Pencil,
  ImageIcon,
  Video,
  FileText,
  Link,
  Smile,
  Send,
  Globe,
  Lock,
  Users,
  UserPlus,
  UserMinus,
  School,
  Briefcase,
  Award,
  Settings,
  LogOut,
} from "lucide-react";

interface UserProfileProps {
  userId: string;
}

interface UserStats {
  posts: number;
  followers: number;
  following: number;
  saved: number;
}

interface UserData {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage: string;
  coverImage: string;
  bio: string;
  address: string;
  phone?: string;
  role?: string;
  education?: {
    school: string;
    degree: string;
    year: string;
  }[];
  work?: {
    company: string;
    position: string;
    years: string;
  }[];
  skills?: string[];
  interests?: string[];
  joinedAt?: string;
  isFollowing?: boolean;
  isFollower?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  // State
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postContent, setPostContent] = useState("");
  const [postMedia, setPostMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [postPrivacy, setPostPrivacy] = useState("public");
  const [userStats, setUserStats] = useState<UserStats>({
    posts: 0,
    followers: 0,
    following: 0,
    saved: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowAnimation, setShowFollowAnimation] = useState(false);
  const [showGalleryIndex, setShowGalleryIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const profileFileInputRef = useRef<HTMLInputElement | null>(null);

  // Hooks
  const { data: session } = useSession();
  const { theme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  const isDarkMode = theme === "dark";
  const isOwnProfile = session?.user?.id === userId;

  // Effects

  // Fetch user data
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Fetch user stats
  useEffect(() => {
    if (userId) {
      fetchUserStats();
    }
  }, [userId]);

  // Set gallery images
  useEffect(() => {
    // This would normally come from the API
    // For now, we'll use placeholder images
    setGalleryImages([
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
      "/placeholder.svg?height=400&width=400",
    ]);
  }, []);

  // Functions

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/user/${userId}`);
      setUser(response.data);
      setIsFollowing(response.data.isFollowing || false);
      setLoading(false);
    } catch (error) {
      setError("Failed to load user data");
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // This would be a real API call in production
      // For now, we'll use mock data
      setUserStats({
        posts: 24,
        followers: 1250,
        following: 420,
        saved: 56,
      });
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  const handleProfileUpdate = async () => {
    await fetchUserData();
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handlePostContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPostContent(e.target.value);
  };

  const handlePostMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostMedia(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = async () => {
    if (!postContent.trim() && !postMedia) {
      toast({
        title: "Empty post",
        description: "Please add some content or media to your post.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", postContent);
      formData.append("privacy", postPrivacy);
      if (postMedia) {
        formData.append("media", postMedia);
      }

      await axios.post("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Post created",
        description: "Your post has been successfully created.",
      });

      setIsAddPostModalOpen(false);
      setPostContent("");
      setPostMedia(null);
      setMediaPreview(null);
      setPostPrivacy("public");

      // Refresh the user data to include the new post
      await fetchUserData();
      await fetchUserStats();

      // Force refresh of timeline
      if (activeTab === "posts") {
        setActiveTab("about");
        setTimeout(() => setActiveTab("posts"), 10);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axios.delete(`/api/follow/${userId}`);
        setIsFollowing(false);
        setUserStats((prev) => ({
          ...prev,
          followers: prev.followers - 1,
        }));
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${user?.name}.`,
        });
      } else {
        await axios.post(`/api/follow/${userId}`);
        setIsFollowing(true);
        setShowFollowAnimation(true);
        setUserStats((prev) => ({
          ...prev,
          followers: prev.followers + 1,
        }));
        toast({
          title: "Following",
          description: `You are now following ${user?.name}.`,
        });

        // Hide animation after 2 seconds
        setTimeout(() => {
          setShowFollowAnimation(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCoverImageClick = () => {
    if (isOwnProfile) {
      coverFileInputRef.current?.click();
    } else {
      setModalImage(
        user?.coverImage || "/placeholder.svg?height=300&width=1200"
      );
      setIsImageModalOpen(true);
    }
  };

  const handleProfileImageClick = () => {
    if (isOwnProfile) {
      profileFileInputRef.current?.click();
    } else {
      setModalImage(
        user?.profileImage || "/placeholder.svg?height=300&width=300"
      );
      setIsImageModalOpen(true);
    }
  };

  const handleCoverImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("coverImage", file);

        await axios.patch(`/api/user/${userId}/cover`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        await fetchUserData();

        toast({
          title: "Cover image updated",
          description: "Your cover image has been successfully updated.",
        });
      } catch (error) {
        console.error("Error updating cover image:", error);
        toast({
          title: "Error",
          description: "Failed to update cover image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleProfileImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("profileImage", file);

        await axios.patch(`/api/user/${userId}/profile-image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        await fetchUserData();

        toast({
          title: "Profile image updated",
          description: "Your profile image has been successfully updated.",
        });
      } catch (error) {
        console.error("Error updating profile image:", error);
        toast({
          title: "Error",
          description: "Failed to update profile image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleNextGalleryImage = () => {
    setShowGalleryIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevGalleryImage = () => {
    setShowGalleryIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  // Loading state
  if (loading) {
    return <ProfileSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="text-destructive text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button
          onClick={() => router.push("/")}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-b from-teal-50/50 to-blue-50/50 dark:from-teal-950/20 dark:to-blue-950/20"
      )}
    >
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={coverFileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleCoverImageChange}
      />
      <input
        type="file"
        ref={profileFileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleProfileImageChange}
      />

      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden rounded-b-3xl shadow-md">
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-10"
          aria-hidden="true"
        />

        <div
          onClick={handleCoverImageClick}
          className={cn(
            "relative h-full w-full cursor-pointer group",
            isOwnProfile && "hover:opacity-90 transition-opacity"
          )}
        >
          <Image
            src={user?.coverImage || "/placeholder.svg?height=300&width=1200"}
            alt="Cover"
            layout="fill"
            objectFit="cover"
            priority
            className="transition-transform duration-700 ease-in-out group-hover:scale-105"
          />

          {isOwnProfile && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative z-20 -mt-16 sm:-mt-24 mb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            {/* Profile Picture and Name */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end">
              <div className="relative" onClick={handleProfileImageClick}>
                <div
                  className={cn(
                    "h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden relative cursor-pointer group shadow-lg",
                    isOwnProfile && "hover:opacity-90 transition-opacity"
                  )}
                >
                  {user?.profileImage ? (
                    <Image
                      src={user.profileImage || "/placeholder.svg"}
                      alt="Profile"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full transition-transform duration-700 ease-in-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/40 dark:to-blue-900/40">
                      <User className="h-16 w-16 text-teal-600 dark:text-teal-400" />
                    </div>
                  )}

                  {isOwnProfile && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                {/* Follow animation */}
                <AnimatePresence>
                  {showFollowAnimation && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
                    >
                      <Check className="w-16 h-16 text-teal-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {user?.name || "User"}
                </h1>
                <p className="text-teal-600 dark:text-teal-400">
                  @{user?.username || "username"}
                </p>

                {user?.role && (
                  <Badge
                    variant="outline"
                    className="mt-2 bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800"
                  >
                    {user.role}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex mt-4 md:mt-0 space-x-2 justify-center md:justify-end">
              {!isOwnProfile && (
                <>
                  <Button
                    onClick={handleFollow}
                    variant={isFollowing ? "outline" : "default"}
                    className={cn(
                      "transition-all",
                      isFollowing
                        ? "border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-900/20"
                        : "bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-800"
                    )}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>

                  <Button className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </>
              )}

              {isOwnProfile && (
                <>
                  <Dialog
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-900/20"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[1000px]">
                      <EditProfile
                        user={user as any}
                        onClose={() => {
                          setIsEditModalOpen(false);
                          handleProfileUpdate();
                        }}
                      />
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={isAddPostModalOpen}
                    onOpenChange={setIsAddPostModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-800">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                        Create a New Post
                      </h2>

                      <div className="mb-4">
                        <Textarea
                          placeholder="What's on your mind?"
                          value={postContent}
                          onChange={handlePostContentChange}
                          className="mb-4 min-h-[120px] focus-visible:ring-teal-500"
                        />

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      fileInputRef.current?.click()
                                    }
                                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20"
                                  >
                                    <ImageIcon className="h-5 w-5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Add Image</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      fileInputRef.current?.click()
                                    }
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                                  >
                                    <Video className="h-5 w-5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Add Video</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/20"
                                  >
                                    <FileText className="h-5 w-5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Add Document</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20"
                                  >
                                    <Link className="h-5 w-5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Add Link</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/20"
                                  >
                                    <Smile className="h-5 w-5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Add Emoji</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-teal-200 hover:border-teal-300 dark:border-teal-800 dark:hover:border-teal-700"
                              >
                                {postPrivacy === "public" && (
                                  <Globe className="h-4 w-4 mr-2 text-teal-600 dark:text-teal-400" />
                                )}
                                {postPrivacy === "friends" && (
                                  <Users className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                                )}
                                {postPrivacy === "private" && (
                                  <Lock className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                                )}
                                {postPrivacy === "public" && "Public"}
                                {postPrivacy === "friends" && "Friends"}
                                {postPrivacy === "private" && "Private"}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => setPostPrivacy("public")}
                                className="text-teal-600 dark:text-teal-400 focus:text-teal-700 dark:focus:text-teal-300 focus:bg-teal-50 dark:focus:bg-teal-900/20"
                              >
                                <Globe className="h-4 w-4 mr-2" />
                                Public
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setPostPrivacy("friends")}
                                className="text-blue-600 dark:text-blue-400 focus:text-blue-700 dark:focus:text-blue-300 focus:bg-blue-50 dark:focus:bg-blue-900/20"
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Friends
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setPostPrivacy("private")}
                                className="text-purple-600 dark:text-purple-400 focus:text-purple-700 dark:focus:text-purple-300 focus:bg-purple-50 dark:focus:bg-purple-900/20"
                              >
                                <Lock className="h-4 w-4 mr-2" />
                                Private
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handlePostMediaChange}
                          className="hidden"
                          ref={fileInputRef}
                        />

                        {mediaPreview && (
                          <div className="relative mt-2 rounded-md overflow-hidden border border-teal-200 dark:border-teal-800 shadow-sm">
                            {postMedia?.type.startsWith("image") ? (
                              <Image
                                src={mediaPreview || "/placeholder.svg"}
                                alt="Media preview"
                                width={500}
                                height={300}
                                className="object-cover w-full max-h-[300px]"
                              />
                            ) : (
                              <video
                                src={mediaPreview}
                                controls
                                className="w-full max-h-[300px]"
                              />
                            )}
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full"
                              onClick={() => {
                                setPostMedia(null);
                                setMediaPreview(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={handlePostSubmit}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-800"
                        disabled={!postContent.trim() && !postMedia}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Post
                      </Button>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: "Link copied",
                        description: "Profile link copied to clipboard",
                      });
                    }}
                    className="text-teal-600 dark:text-teal-400 focus:text-teal-700 dark:focus:text-teal-300 focus:bg-teal-50 dark:focus:bg-teal-900/20"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </DropdownMenuItem>

                  {isOwnProfile && (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push("/settings")}
                        className="text-blue-600 dark:text-blue-400 focus:text-blue-700 dark:focus:text-blue-300 focus:bg-blue-50 dark:focus:bg-blue-900/20"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-rose-600 dark:text-rose-400 focus:text-rose-700 dark:focus:text-rose-300 focus:bg-rose-50 dark:focus:bg-rose-900/20">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* User Stats */}
          <div className="mt-6 flex justify-center md:justify-start">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
              <div className="text-center p-3 bg-white/80 dark:bg-gray-800/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {userStats.posts}
                </p>
                <p className="text-muted-foreground text-sm">Posts</p>
              </div>
              <div className="text-center p-3 bg-white/80 dark:bg-gray-800/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userStats.followers}
                </p>
                <p className="text-muted-foreground text-sm">Followers</p>
              </div>
              <div className="text-center p-3 bg-white/80 dark:bg-gray-800/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {userStats.following}
                </p>
                <p className="text-muted-foreground text-sm">Following</p>
              </div>
              <div className="text-center p-3 bg-white/80 dark:bg-gray-800/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {userStats.saved}
                </p>
                <p className="text-muted-foreground text-sm">Saved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio and Location */}
        <div className="mb-6 max-w-3xl mx-auto">
          <Card className="bg-white/90 dark:bg-gray-800/60 shadow-sm hover:shadow-md transition-shadow border-teal-100 dark:border-teal-900/50">
            <CardContent className="p-6">
              {user?.bio && (
                <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {user.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4">
                {user?.address && (
                  <div className="flex items-center text-teal-600 dark:text-teal-400">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{user.address}</span>
                  </div>
                )}

                {user?.email && (
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <Mail className="w-4 h-4 mr-1" />
                    <span>{user.email}</span>
                  </div>
                )}

                {user?.phone && (
                  <div className="flex items-center text-purple-600 dark:text-purple-400">
                    <Phone className="w-4 h-4 mr-1" />
                    <span>{user.phone}</span>
                  </div>
                )}

                {user?.joinedAt && (
                  <div className="flex items-center text-amber-600 dark:text-amber-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                      Joined {format(new Date(user.joinedAt), "MMMM yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="posts"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="grid grid-cols-4 max-w-md mx-auto bg-white/70 dark:bg-gray-800/50 p-1 rounded-full">
            <TabsTrigger
              value="posts"
              className="rounded-full data-[state=active]:bg-teal-100 data-[state=active]:text-teal-800 dark:data-[state=active]:bg-teal-900/40 dark:data-[state=active]:text-teal-100"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="rounded-full data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900/40 dark:data-[state=active]:text-blue-100"
            >
              Saved
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              className="rounded-full data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 dark:data-[state=active]:bg-purple-900/40 dark:data-[state=active]:text-purple-100"
            >
              Gallery
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="rounded-full data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 dark:data-[state=active]:bg-amber-900/40 dark:data-[state=active]:text-amber-100"
            >
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <TimelineList userId={userId} />
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <SavedPostsList userId={userId} />
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-sm hover:shadow-md group"
                  onClick={() => {
                    setModalImage(image);
                    setShowGalleryIndex(index);
                    setIsImageModalOpen(true);
                  }}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Gallery image ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-700 ease-in-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-3">
                    <p className="text-white text-sm font-medium">
                      Image {index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education */}
              <Card className="bg-white/90 dark:bg-gray-800/60 shadow-sm hover:shadow-md transition-shadow border-teal-100 dark:border-teal-900/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center text-teal-700 dark:text-teal-300">
                      <School className="mr-2 h-5 w-5" />
                      Education
                    </h3>
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-900/20"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>

                  {user?.education && user.education.length > 0 ? (
                    <div className="space-y-4">
                      {user.education.map((edu, index) => (
                        <div
                          key={index}
                          className="border-b border-teal-100 dark:border-teal-900/50 pb-4 last:border-0 last:pb-0"
                        >
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">
                            {edu.school}
                          </h4>
                          <p className="text-teal-600 dark:text-teal-400">
                            {edu.degree}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {edu.year}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No education information added yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Work Experience */}
              <Card className="bg-white/90 dark:bg-gray-800/60 shadow-sm hover:shadow-md transition-shadow border-blue-100 dark:border-blue-900/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center text-blue-700 dark:text-blue-300">
                      <Briefcase className="mr-2 h-5 w-5" />
                      Work Experience
                    </h3>
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>

                  {user?.work && user.work.length > 0 ? (
                    <div className="space-y-4">
                      {user.work.map((work, index) => (
                        <div
                          key={index}
                          className="border-b border-blue-100 dark:border-blue-900/50 pb-4 last:border-0 last:pb-0"
                        >
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">
                            {work.company}
                          </h4>
                          <p className="text-blue-600 dark:text-blue-400">
                            {work.position}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {work.years}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No work experience added yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="bg-white/90 dark:bg-gray-800/60 shadow-sm hover:shadow-md transition-shadow border-purple-100 dark:border-purple-900/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center text-purple-700 dark:text-purple-300">
                      <Award className="mr-2 h-5 w-5" />
                      Skills
                    </h3>
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>

                  {user?.skills && user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No skills added yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Interests */}
              <Card className="bg-white/90 dark:bg-gray-800/60 shadow-sm hover:shadow-md transition-shadow border-amber-100 dark:border-amber-900/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center text-amber-700 dark:text-amber-300">
                      <Heart className="mr-2 h-5 w-5" />
                      Interests
                    </h3>
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/20"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>

                  {user?.interests && user.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/20"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No interests added yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
          <div className="relative">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg">
              {modalImage && (
                <div className="relative">
                  <Image
                    src={modalImage || "/placeholder.svg"}
                    alt="Full size image"
                    width={1200}
                    height={800}
                    className="max-h-[80vh] w-auto object-contain mx-auto rounded-md"
                  />

                  {activeTab === "gallery" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                        onClick={handlePrevGalleryImage}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                        onClick={handleNextGalleryImage}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 rounded-full bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setIsImageModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Profile Skeleton component for loading state
const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-blue-50/50 dark:from-teal-950/20 dark:to-blue-950/20">
      {/* Cover Image Skeleton */}
      <div className="relative h-48 sm:h-64 md:h-80 rounded-b-3xl overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative z-20 -mt-16 sm:-mt-24 mb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            {/* Profile Picture and Name Skeleton */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end">
              <Skeleton className="h-32 w-32 sm:h-40 sm:w-40 rounded-full" />

              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex mt-4 md:mt-0 space-x-2 justify-center md:justify-end">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>

          {/* User Stats Skeleton */}
          <div className="mt-6 flex justify-center md:justify-start">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bio Skeleton */}
        <div className="mb-6 max-w-3xl mx-auto">
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 max-w-md mx-auto rounded-full mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
