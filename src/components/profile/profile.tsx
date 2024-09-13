// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import { useState, useEffect } from "react";
// import { notFound } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import { MapPin, MessageSquare, Edit, Camera } from "lucide-react";
// import { useTheme } from "next-themes";
// import EditProfile from "./edit-profile"; // Make sure this path is correct

// export default function UserProfile({
//   params,
// }: {
//   params: { userId: string };
// }) {
//   const { theme } = useTheme();
//   const [userInfo, setUserInfo] = useState<any>(null);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);

//   useEffect(() => {
//     async function loadUserData() {
//       const res = await fetch(`/api/users/${params.userId}`, {
//         cache: "no-store",
//       });

//       if (!res.ok) {
//         notFound();
//       }

//       const data = await res.json();
//       setUserInfo(data);
//     }
//     loadUserData();
//   }, [params.userId]);

//   const isDarkMode = theme === "dark";

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   function handleImageUpload(
//     e: React.ChangeEvent<HTMLInputElement>,
//     isCover: boolean
//   ): void {
//     // Implement image upload logic here
//     console.log("Image upload not implemented yet");
//   }

//   return (
//     <div
//       className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
//     >
//       <div className="max-w-4xl mx-auto p-4">
//         {/* Cover Image */}
//         <div className="relative h-48 md:h-64 rounded-t-lg overflow-hidden">
//           <Dialog>
//             <DialogTrigger asChild>
//               <img
//                 src={
//                   userInfo?.coverImage ||
//                   "/placeholder.svg?height=300&width=1200"
//                 }
//                 alt="Cover"
//                 className="w-full h-full object-cover cursor-pointer"
//               />
//             </DialogTrigger>
//             <DialogContent className="max-w-3xl">
//               <img
//                 src={
//                   userInfo?.coverImage ||
//                   "/placeholder.svg?height=300&width=1200"
//                 }
//                 alt="Cover Preview"
//                 className="w-full h-auto"
//               />
//             </DialogContent>
//           </Dialog>
//           <label htmlFor="cover-upload" className="absolute bottom-4 right-4">
//             <input
//               id="cover-upload"
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={(e) => handleImageUpload(e, true)}
//             />
//             <Button
//               size="icon"
//               className="rounded-full"
//               variant={isDarkMode ? "secondary" : "outline"}
//             >
//               <Camera className="h-4 w-4" />
//               <span className="sr-only">Upload cover photo</span>
//             </Button>
//           </label>
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
//                   <DialogTrigger asChild>
//                     <img
//                       src={
//                         userInfo?.profileImage ||
//                         "/placeholder.svg?height=128&width=128"
//                       }
//                       alt="Profile"
//                       className={`w-32 h-32 rounded-full border-4 cursor-pointer ${
//                         isDarkMode ? "border-gray-800" : "border-white"
//                       }`}
//                     />
//                   </DialogTrigger>
//                   <DialogContent className="max-w-sm">
//                     <img
//                       src={
//                         userInfo?.profileImage ||
//                         "/placeholder.svg?height=128&width=128"
//                       }
//                       alt="Profile Preview"
//                       className="w-full h-auto rounded-full"
//                     />
//                   </DialogContent>
//                 </Dialog>
//                 <label
//                   htmlFor="profile-upload"
//                   className="absolute bottom-0 right-0"
//                 >
//                   <input
//                     id="profile-upload"
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     onChange={(e) => handleImageUpload(e, false)}
//                   />
//                   <Button
//                     size="icon"
//                     className="rounded-full"
//                     variant={isDarkMode ? "secondary" : "outline"}
//                   >
//                     <Camera className="h-4 w-4" />
//                     <span className="sr-only">Upload profile photo</span>
//                   </Button>
//                 </label>
//               </div>
//             </div>

//             {/* User Info */}
//             <div className="mt-16 mb-6">
//               <h1
//                 className={`text-2xl font-bold ${
//                   isDarkMode ? "text-gray-100" : "text-gray-900"
//                 }`}
//               >
//                 {userInfo?.name || "Please wait..."}
//               </h1>
//               <p
//                 className={`text-lg ${
//                   isDarkMode ? "text-gray-300" : "text-gray-600"
//                 }`}
//               >
//                 {userInfo?.username || "@username"}
//               </p>
//               <div
//                 className={`flex items-center mt-2 ${
//                   isDarkMode ? "text-gray-400" : "text-gray-500"
//                 }`}
//               >
//                 <MapPin className="w-4 h-4 mr-1" />
//                 <span>{userInfo?.address || "address"}</span>
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
//                 <DialogContent className="sm:max-w-[425px]">
//                   <EditProfile
//                     userInfo={userInfo}
//                     onClose={() => setIsEditModalOpen(false)}
//                   />
//                 </DialogContent>
//               </Dialog>
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
//                 About
//               </h2>
//               <p>
//                 {userInfo?.bio ||
//                   "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
//               </p>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }
