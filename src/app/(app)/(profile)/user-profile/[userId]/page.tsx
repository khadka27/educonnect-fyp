// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import { useState, useEffect, ChangeEvent } from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
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
// import EditProfile from "@/components/profile/edit-profile";
// import { useSession } from "next-auth/react";
// import Image from "next/image";
// import Avatar from "react-avatar";
// import { useToast } from "@/hooks/use-toast";

// const ProfilePage = () => {
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
//     if (session) {
//       fetchUserData();
//     }
//   }, [session]);

//   const fetchUserData = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`/api/user/${session?.user.id}`);
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

//   if (loading) return <div>Loading...</div>;
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
//               <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//                 <DialogTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={`flex-1 ${
//                       isDarkMode
//                         ? "border-gray-600 text-gray-300"
//                         : "border-gray-300 text-gray-700"
//                     }`}
//                   >
//                     <Edit className="w-4 h-4 mr-2" />
//                     Edit Profile
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="sm:max-w-[1000px]">
//                   <EditProfile
//                     user={user}
//                     onClose={() => {
//                       setIsEditModalOpen(false);
//                       handleProfileUpdate();
//                     }}
//                   />
//                 </DialogContent>
//               </Dialog>
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
//     </div>
//   );
// };

// export default ProfilePage;

import React from 'react';
import UserProfile from 'src/components/profile/user-profile'; // Adjust the import path as needed


function UserProfilePage({ params }: { params: { userId: string } }) {
  return <UserProfile userId={params.userId} />;
}



export default UserProfilePage; // Fix the export statement
