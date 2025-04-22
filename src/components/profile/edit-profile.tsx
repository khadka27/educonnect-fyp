// "use client";

// import { useState, useEffect, ChangeEvent, DragEvent } from "react";
// import axios from "axios";
// import { Button } from "src/components/ui/button";
// import { Input } from "src/components/ui/input";
// import { Label } from "src/components/ui/label";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "src/components/ui/card";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "src/components/ui/tabs";
// import { useSession } from "next-auth/react";
// import { useToast } from "@/hooks/use-toast";
// import { Loader2, Upload, Eye, EyeOff } from "lucide-react";
// import ReactPasswordStrengthBar from "react-password-strength-bar";
// import { Textarea } from "src/components/ui/textarea";
// import { ScrollArea } from "src/components/ui/scroll-area";
// import { useTheme } from "next-themes";

// function EditProfile() {
//   const { data: session } = useSession();
//   const { toast } = useToast();
//   const { theme } = useTheme();
//   const [name, setName] = useState<string>("");
//   const [bio, setBio] = useState<string>("");
//   const [address, setAddress] = useState<string>("");
//   const [profileImage, setProfileImage] = useState<File | null>(null);
//   const [coverImage, setCoverImage] = useState<File | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [isEditing, setIsEditing] = useState<boolean>(false);

//   // Password change state
//   const [currentPassword, setCurrentPassword] = useState<string>("");
//   const [newPassword, setNewPassword] = useState<string>("");
//   const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
//   const [showCurrentPassword, setShowCurrentPassword] =
//     useState<boolean>(false);
//   const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
//   const [showConfirmPassword, setShowConfirmPassword] =
//     useState<boolean>(false);

//   // Data updated state to trigger re-render
//   const [dataUpdated, setDataUpdated] = useState<boolean>(false);

//   useEffect(() => {
//     if (session?.user?.id) {
//       const fetchUserData = async () => {
//         try {
//           const response = await axios.get(`/api/user/${session.user.id}`);
//           setName(response.data.name || "");
//           setBio(response.data.bio || "");
//           setAddress(response.data.address || "");
//         } catch (error) {
//           console.error("Error fetching user data:", error);
//         }
//       };
//       fetchUserData();
//     }
//   }, [session?.user?.id, dataUpdated]);

//   const handleSave = async (data: { [key: string]: string | FormData }) => {
//     setLoading(true);
//     try {
//       await axios.put(`/api/user/${session?.user.id}`, data);
//       setDataUpdated((prev) => !prev);
//       toast({
//         title: "Success",
//         description: `Information updated successfully`,
//         className: "bg-green-500 text-white",
//       });
//     } catch (error) {
//       console.error("Error updating information:", error);
//       toast({
//         title: "Error",
//         description: `Failed to update information`,
//         className: "bg-red-500 text-white",
//       });
//     } finally {
//       setLoading(false);
//       setIsEditing(false);
//     }
//   };

//   const handlePersonalInfoSave = () => {
//     const data: { [key: string]: string | FormData } = {};
//     if (name) data.name = name;
//     if (bio) data.bio = bio;
//     if (address) data.address = address;
//     handleSave(data);
//   };

//   const handleImageUpload = async (imageType: string) => {
//     const file = imageType === "profileImage" ? profileImage : coverImage;
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("image", file);
//     formData.append("type", imageType);
//     if (session?.user?.id) {
//       formData.append("userId", session.user.id);
//     }

//     try {
//       const response = await axios.post(`/api/user/upload-image`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (response.data && response.data.error) {
//         throw new Error(response.data.error);
//       }

//       toast({
//         title: "Success",
//         description: `${
//           imageType === "profileImage" ? "Profile" : "Cover"
//         } image updated`,
//       });
//     } catch (error) {
//       toast({ title: "Error", description: "Failed to update image" });
//     }
//   };

//   const handleImageChange = (
//     e: ChangeEvent<HTMLInputElement>,
//     type: "profileImage" | "coverImage"
//   ) => {
//     const file = e.target.files?.[0] || null;
//     if (type === "profileImage") setProfileImage(file);
//     if (type === "coverImage") setCoverImage(file);
//   };

//   const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   const handleDrop = (
//     e: DragEvent<HTMLDivElement>,
//     type: "profileImage" | "coverImage"
//   ) => {
//     e.preventDefault();
//     e.stopPropagation();
//     const file = e.dataTransfer.files[0];
//     if (file) {
//       if (type === "profileImage") setProfileImage(file);
//       if (type === "coverImage") setCoverImage(file);
//     }
//   };

//   const handlePasswordChange = async () => {
//     if (newPassword !== confirmNewPassword) {
//       toast({
//         title: "Error",
//         description: "Passwords do not match",
//         className: "bg-red-500 text-white",
//       });
//       return;
//     }

//     if (newPassword === currentPassword) {
//       toast({
//         title: "Error",
//         description: "New password cannot be the same as the old password",
//         className: "bg-red-500 text-white",
//       });
//       return;
//     }

//     setLoading(true);

//     try {
//       // Extract the user id from your session (make sure session contains the user id)
//       const userId = session?.user?.id;
//       if (!userId) {
//         throw new Error("User id not found in session");
//       }

//       await axios.put(`/api/user/update-password`, {
//         id: userId,
//         currentPassword,
//         newPassword,
//       });
//       toast({
//         title: "Success",
//         description: "Password updated successfully",
//         className: "bg-green-500 text-white",
//       });
//       setCurrentPassword("");
//       setNewPassword("");
//       setConfirmNewPassword("");
//     } catch (error) {
//       console.error("Error updating password:", error);
//       toast({
//         title: "Error",
//         description: "Failed to update password",
//         className: "bg-red-500 text-white",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-green-50 dark:bg-gray-900 flex items-center justify-center p-4">
//       <Card className="w-full max-w-4xl h-[90vh] overflow-hidden">
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-300">
//             Edit Profile
//           </CardTitle>
//         </CardHeader>
//         <ScrollArea className="h-[calc(90vh-4rem)]">
//           <CardContent>
//             <Tabs defaultValue="account" className="w-full">
//               <TabsList className="grid w-full grid-cols-2 mb-4">
//                 <TabsTrigger
//                   value="account"
//                   className="bg-green-400 text-white hover:bg-green-500 data-[state=active]:bg-green-600"
//                 >
//                   Personal Information
//                 </TabsTrigger>
//                 <TabsTrigger
//                   value="password"
//                   className="bg-green-400 text-white hover:bg-green-500 data-[state=active]:bg-green-600"
//                 >
//                   Change Password
//                 </TabsTrigger>
//               </TabsList>

//               <TabsContent value="account" className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div
//                     className="space-y-2 border-2 border-dashed border-green-300 dark:border-green-700 p-4 rounded-lg"
//                     onDragOver={handleDragOver}
//                     onDrop={(e) => handleDrop(e, "profileImage")}
//                   >
//                     <Label htmlFor="profileImage">Profile Image</Label>
//                     <Input
//                       id="profileImage"
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleImageChange(e, "profileImage")}
//                     />
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       Drag and drop or click to select
//                     </p>
//                     <Button
//                       onClick={() => handleImageUpload("profileImage")}
//                       disabled={!profileImage || loading}
//                       className="w-full bg-green-500 hover:bg-green-600"
//                     >
//                       {loading ? (
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       ) : (
//                         <Upload className="mr-2 h-4 w-4" />
//                       )}
//                       Upload Profile Image
//                     </Button>
//                   </div>
//                   <div
//                     className="space-y-2 border-2 border-dashed border-green-300 dark:border-green-700 p-4 rounded-lg"
//                     onDragOver={handleDragOver}
//                     onDrop={(e) => handleDrop(e, "coverImage")}
//                   >
//                     <Label htmlFor="coverImage">Cover Image</Label>
//                     <Input
//                       id="coverImage"
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleImageChange(e, "coverImage")}
//                     />
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       Drag and drop or click to select
//                     </p>
//                     <Button
//                       onClick={() => handleImageUpload("coverImage")}
//                       disabled={!coverImage || loading}
//                       className="w-full bg-green-500 hover:bg-green-600"
//                     >
//                       {loading ? (
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       ) : (
//                         <Upload className="mr-2 h-4 w-4" />
//                       )}
//                       Upload Cover Image
//                     </Button>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="name">Name</Label>
//                   <Input
//                     id="name"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     disabled={!isEditing}
//                     className="bg-green-50 dark:bg-gray-800"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="bio">Bio</Label>
//                   <Textarea
//                     id="bio"
//                     value={bio}
//                     onChange={(e) => setBio(e.target.value)}
//                     disabled={!isEditing}
//                     className="bg-green-50 dark:bg-gray-800"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="address">Address</Label>
//                   <Input
//                     id="address"
//                     value={address}
//                     onChange={(e) => setAddress(e.target.value)}
//                     disabled={!isEditing}
//                     className="bg-green-50 dark:bg-gray-800"
//                   />
//                 </div>

//                 <div className="flex justify-end space-x-2">
//                   <Button
//                     onClick={() => setIsEditing(true)}
//                     disabled={loading || isEditing}
//                     className="bg-blue-500 hover:bg-blue-600"
//                   >
//                     Edit
//                   </Button>
//                   <Button
//                     onClick={handlePersonalInfoSave}
//                     disabled={loading || !isEditing}
//                     className="bg-green-500 hover:bg-green-600"
//                   >
//                     {loading ? (
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     ) : (
//                       "Save"
//                     )}
//                   </Button>
//                 </div>
//               </TabsContent>

//               <TabsContent value="password" className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="currentPassword">Current Password</Label>
//                   <div className="relative">
//                     <Input
//                       id="currentPassword"
//                       type={showCurrentPassword ? "text" : "password"}
//                       value={currentPassword}
//                       onChange={(e) => setCurrentPassword(e.target.value)}
//                       className="bg-green-50 dark:bg-gray-800 pr-10"
//                     />
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                       onClick={() =>
//                         setShowCurrentPassword(!showCurrentPassword)
//                       }
//                     >
//                       {showCurrentPassword ? (
//                         <EyeOff className="h-4 w-4" />
//                       ) : (
//                         <Eye className="h-4 w-4" />
//                       )}
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="newPassword">New Password</Label>
//                   <div className="relative">
//                     <Input
//                       id="newPassword"
//                       type={showNewPassword ? "text" : "password"}
//                       value={newPassword}
//                       onChange={(e) => setNewPassword(e.target.value)}
//                       className="bg-green-50 dark:bg-gray-800 pr-10"
//                     />
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                       onClick={() => setShowNewPassword(!showNewPassword)}
//                     >
//                       {showNewPassword ? (
//                         <EyeOff className="h-4 w-4" />
//                       ) : (
//                         <Eye className="h-4 w-4" />
//                       )}
//                     </Button>
//                   </div>
//                   <ReactPasswordStrengthBar
//                     password={newPassword}
//                     scoreWords={[
//                       "Weak",
//                       "Okay",
//                       "Good",
//                       "Strong",
//                       "Very Strong",
//                     ]}
//                     shortScoreWord="Too Short"
//                     scoreWordStyle={{
//                       color: theme === "dark" ? "#ffffff" : "#000000",
//                     }}
//                     barColors={[
//                       "#ddd",
//                       "#ef4836",
//                       "#f6b44d",
//                       "#2b90ef",
//                       "#25c281",
//                     ]}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="confirmNewPassword">
//                     Confirm New Password
//                   </Label>
//                   <div className="relative">
//                     <Input
//                       id="confirmNewPassword"
//                       type={showConfirmPassword ? "text" : "password"}
//                       value={confirmNewPassword}
//                       onChange={(e) => setConfirmNewPassword(e.target.value)}
//                       className="bg-green-50 dark:bg-gray-800 pr-10"
//                     />
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                       onClick={() =>
//                         setShowConfirmPassword(!showConfirmPassword)
//                       }
//                     >
//                       {showConfirmPassword ? (
//                         <EyeOff className="h-4 w-4" />
//                       ) : (
//                         <Eye className="h-4 w-4" />
//                       )}
//                     </Button>
//                   </div>
//                 </div>
//                 <Button
//                   onClick={handlePasswordChange}
//                   disabled={
//                     loading ||
//                     !currentPassword ||
//                     !newPassword ||
//                     !confirmNewPassword
//                   }
//                   className="w-full bg-green-500 hover:bg-green-600"
//                 >
//                   {loading ? (
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   ) : (
//                     "Change Password"
//                   )}
//                 </Button>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </ScrollArea>
//       </Card>
//     </div>
//   );
// }

// export default EditProfile;

"use client";

import type React from "react";

import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type DragEvent,
} from "react";
import axios from "axios";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";
import { Textarea } from "src/components/ui/textarea";
import { ScrollArea } from "src/components/ui/scroll-area";
import { Badge } from "src/components/ui/badge";
import { Separator } from "src/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";

// Icons
import {
  Loader2,
  Upload,
  Eye,
  EyeOff,
  User,
  Camera,
  X,
  Save,
  Trash2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Briefcase,
  School,
  Calendar,
  Link,
  Plus,
  AlertTriangle,
  Lock,
  Key,
  LogOut,
  RefreshCw,
  ImageIcon,
  FileText,
  Settings,
  Download,
} from "lucide-react";

// Password Strength
import ReactPasswordStrengthBar from "react-password-strength-bar";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startYear: string;
  endYear: string | "Present";
  description?: string;
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string | "Present";
  description?: string;
}

interface Skill {
  id: string;
  name: string;
  level?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

interface UserData {
  id: string;
  name: string;
  username?: string;
  email: string;
  bio?: string;
  address?: string;
  phone?: string;
  website?: string;
  profileImage?: string;
  coverImage?: string;
  socialLinks?: SocialLink[];
  education?: Education[];
  workExperience?: WorkExperience[];
  skills?: Skill[];
  interests?: string[];
  joinedAt?: string;
}

interface EditProfileProps {
  user?: UserData;
  onClose?: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({
  user: initialUser,
  onClose,
}) => {
  // State
  const [activeTab, setActiveTab] = useState("personal");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState<boolean>(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] =
    useState<boolean>(false);

  // Form state
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState<string>("");

  // Image state
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [isDraggingProfile, setIsDraggingProfile] = useState<boolean>(false);
  const [isDraggingCover, setIsDraggingCover] = useState<boolean>(false);
  const [showImageCropper, setShowImageCropper] = useState<boolean>(false);
  const [currentImageType, setCurrentImageType] = useState<
    "profile" | "cover" | null
  >(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [showCurrentPassword, setShowCurrentPassword] =
    useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Refs
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { data: session } = useSession();
  const { toast } = useToast();
  const { theme } = useTheme();

  // Effects

  // Initialize user data
  useEffect(() => {
    if (initialUser) {
      setUserData(initialUser);
      setName(initialUser.name || "");
      setUsername(initialUser.username || "");
      setBio(initialUser.bio || "");
      setAddress(initialUser.address || "");
      setPhone(initialUser.phone || "");
      setWebsite(initialUser.website || "");
      setSocialLinks(initialUser.socialLinks || []);
      setEducation(initialUser.education || []);
      setWorkExperience(initialUser.workExperience || []);
      setSkills(initialUser.skills || []);
      setInterests(initialUser.interests || []);
    } else if (session?.user?.id) {
      fetchUserData();
    }
  }, [initialUser, session?.user?.id]);

  // Check for changes
  useEffect(() => {
    if (!userData) return;

    const hasNameChanged = name !== userData.name;
    const hasBioChanged = bio !== (userData.bio || "");
    const hasAddressChanged = address !== (userData.address || "");
    const hasPhoneChanged = phone !== (userData.phone || "");
    const hasWebsiteChanged = website !== (userData.website || "");
    const hasSocialLinksChanged =
      JSON.stringify(socialLinks) !==
      JSON.stringify(userData.socialLinks || []);
    const hasEducationChanged =
      JSON.stringify(education) !== JSON.stringify(userData.education || []);
    const hasWorkExperienceChanged =
      JSON.stringify(workExperience) !==
      JSON.stringify(userData.workExperience || []);
    const hasSkillsChanged =
      JSON.stringify(skills) !== JSON.stringify(userData.skills || []);
    const hasInterestsChanged =
      JSON.stringify(interests) !== JSON.stringify(userData.interests || []);
    const hasProfileImageChanged = !!profileImage;
    const hasCoverImageChanged = !!coverImage;

    setHasChanges(
      hasNameChanged ||
        hasBioChanged ||
        hasAddressChanged ||
        hasPhoneChanged ||
        hasWebsiteChanged ||
        hasSocialLinksChanged ||
        hasEducationChanged ||
        hasWorkExperienceChanged ||
        hasSkillsChanged ||
        hasInterestsChanged ||
        hasProfileImageChanged ||
        hasCoverImageChanged
    );
  }, [
    userData,
    name,
    bio,
    address,
    phone,
    website,
    socialLinks,
    education,
    workExperience,
    skills,
    interests,
    profileImage,
    coverImage,
  ]);

  // Functions

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/user/${session?.user?.id}`);
      const user = response.data;

      setUserData(user);
      setName(user.name || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setAddress(user.address || "");
      setPhone(user.phone || "");
      setWebsite(user.website || "");
      setSocialLinks(user.socialLinks || []);
      setEducation(user.education || []);
      setWorkExperience(user.workExperience || []);
      setSkills(user.skills || []);
      setInterests(user.interests || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!hasChanges) return;

    setSaving(true);
    try {
      // Prepare data for API
      const data: Partial<UserData> = {
        name,
        username,
        bio,
        address,
        phone,
        website,
        socialLinks,
        education,
        workExperience,
        skills,
        interests,
      };

      // Update user data
      await axios.put(`/api/user/${session?.user?.id || userData?.id}`, data);

      // Upload images if needed
      if (profileImage) {
        await handleImageUpload("profileImage");
      }

      if (coverImage) {
        await handleImageUpload("coverImage");
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Refresh user data
      if (session?.user?.id) {
        await fetchUserData();
      }

      // Reset state
      setProfileImage(null);
      setCoverImage(null);
      setProfileImagePreview(null);
      setCoverImagePreview(null);

      // Close modal if callback provided
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError("New password cannot be the same as current password");
      return;
    }

    setPasswordError(null);
    setSaving(true);

    try {
      await axios.put(`/api/user/update-password`, {
        id: session?.user?.id || userData?.id,
        currentPassword,
        newPassword,
      });

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);

      // Handle specific error messages from the API
      const errorMessage =
        error.response?.data?.error || "Failed to update password";
      setPasswordError(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "profileImage" | "coverImage"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleImageFile(file, type);
  };

  const handleImageFile = (file: File, type: "profileImage" | "coverImage") => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Only image files are allowed",
        variant: "destructive",
      });
      return;
    }

    // Set file and preview
    if (type === "profileImage") {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (
    imageType: "profileImage" | "coverImage"
  ) => {
    const file = imageType === "profileImage" ? profileImage : coverImage;
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", imageType);

    if (session?.user?.id) {
      formData.append("userId", session.user.id);
    } else if (userData?.id) {
      formData.append("userId", userData.id);
    }

    try {
      const response = await axios.post(`/api/user/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      console.error(`Error uploading ${imageType}:`, error);
      throw error;
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (
    e: DragEvent<HTMLDivElement>,
    type: "profileImage" | "coverImage"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "profileImage") {
      setIsDraggingProfile(true);
    } else {
      setIsDraggingCover(true);
    }
  };

  const handleDragLeave = (
    e: DragEvent<HTMLDivElement>,
    type: "profileImage" | "coverImage"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "profileImage") {
      setIsDraggingProfile(false);
    } else {
      setIsDraggingCover(false);
    }
  };

  const handleDrop = (
    e: DragEvent<HTMLDivElement>,
    type: "profileImage" | "coverImage"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (type === "profileImage") {
      setIsDraggingProfile(false);
    } else {
      setIsDraggingCover(false);
    }

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageFile(file, type);
    }
  };

  const handleAddSocialLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      platform: "Twitter",
      url: "",
    };
    setSocialLinks([...socialLinks, newLink]);
  };

  const handleRemoveSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter((link) => link.id !== id));
  };

  const handleUpdateSocialLink = (
    id: string,
    field: keyof SocialLink,
    value: string
  ) => {
    setSocialLinks(
      socialLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  const handleAddEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      school: "",
      degree: "",
      fieldOfStudy: "",
      startYear: new Date().getFullYear().toString(),
      endYear: "Present",
      description: "",
    };
    setEducation([...education, newEducation]);
  };

  const handleRemoveEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id));
  };

  const handleUpdateEducation = (
    id: string,
    field: keyof Education,
    value: string
  ) => {
    setEducation(
      education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const handleAddWorkExperience = () => {
    const newWork: WorkExperience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      location: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "Present",
      description: "",
    };
    setWorkExperience([...workExperience, newWork]);
  };

  const handleRemoveWorkExperience = (id: string) => {
    setWorkExperience(workExperience.filter((work) => work.id !== id));
  };

  const handleUpdateWorkExperience = (
    id: string,
    field: keyof WorkExperience,
    value: string
  ) => {
    setWorkExperience(
      workExperience.map((work) =>
        work.id === id ? { ...work, [field]: value } : work
      )
    );
  };

  const handleAddSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: "",
      level: "Intermediate",
    };
    setSkills([...skills, newSkill]);
  };

  const handleRemoveSkill = (id: string) => {
    setSkills(skills.filter((skill) => skill.id !== id));
  };

  const handleUpdateSkill = (id: string, field: keyof Skill, value: string) => {
    setSkills(
      skills.map((skill) =>
        skill.id === id ? { ...skill, [field]: value as any } : skill
      )
    );
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;

    if (!interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    } else {
      toast({
        title: "Duplicate interest",
        description: "This interest is already in your list",
        variant: "destructive",
      });
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleDiscardChanges = () => {
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else if (onClose) {
      onClose();
    }
  };

  const confirmDiscardChanges = () => {
    // Reset all form fields to initial values
    if (userData) {
      setName(userData.name || "");
      setUsername(userData.username || "");
      setBio(userData.bio || "");
      setAddress(userData.address || "");
      setPhone(userData.phone || "");
      setWebsite(userData.website || "");
      setSocialLinks(userData.socialLinks || []);
      setEducation(userData.education || []);
      setWorkExperience(userData.workExperience || []);
      setSkills(userData.skills || []);
      setInterests(userData.interests || []);
    }

    // Reset image state
    setProfileImage(null);
    setCoverImage(null);
    setProfileImagePreview(null);
    setCoverImagePreview(null);

    // Close dialogs
    setShowDiscardDialog(false);

    // Close modal if callback provided
    if (onClose) {
      onClose();
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    try {
      await axios.delete(`/api/user/${session?.user?.id || userData?.id}`);

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
      });

      // Redirect to home page or sign out
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setShowDeleteAccountDialog(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <CardTitle>Loading Profile</CardTitle>
            <CardDescription>
              Please wait while we load your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-16 w-16 animate-spin text-emerald-500 mb-4" />
            <p className="text-muted-foreground">
              Loading your profile data...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="w-full border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscardChanges}
                disabled={saving}
                className="hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveProfile}
                disabled={!hasChanges || saving}
                className={cn(
                  "transition-all",
                  hasChanges
                    ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
          <CardDescription>
            Update your profile information and settings
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6 bg-emerald-50/50 dark:bg-emerald-950/20">
              <TabsTrigger
                value="personal"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 dark:data-[state=active]:bg-emerald-900/40 dark:data-[state=active]:text-emerald-100"
              >
                Personal Info
              </TabsTrigger>
              <TabsTrigger
                value="additional"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 dark:data-[state=active]:bg-emerald-900/40 dark:data-[state=active]:text-emerald-100"
              >
                Additional Info
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 dark:data-[state=active]:bg-emerald-900/40 dark:data-[state=active]:text-emerald-100"
              >
                Security
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 dark:data-[state=active]:bg-emerald-900/40 dark:data-[state=active]:text-emerald-100"
              >
                Account
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(80vh-10rem)] pr-4">
              <TabsContent value="personal" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Image */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="profileImage"
                        className="text-base font-medium"
                      >
                        Profile Image
                      </Label>
                      {profileImagePreview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setProfileImage(null);
                            setProfileImagePreview(null);
                          }}
                          className="h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>

                    <div
                      className={cn(
                        "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-all",
                        isDraggingProfile
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                          : "border-muted-foreground/25 hover:border-emerald-300 dark:hover:border-emerald-700",
                        profileImagePreview ? "h-64" : "h-40"
                      )}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, "profileImage")}
                      onDragLeave={(e) => handleDragLeave(e, "profileImage")}
                      onDrop={(e) => handleDrop(e, "profileImage")}
                    >
                      {profileImagePreview ? (
                        <div className="relative w-40 h-40 rounded-full overflow-hidden">
                          <Image
                            src={profileImagePreview || "/placeholder.svg"}
                            alt="Profile preview"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-full"
                          />
                        </div>
                      ) : userData?.profileImage ? (
                        <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                          <Image
                            src={userData.profileImage || "/placeholder.svg"}
                            alt="Current profile"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-full"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mb-4">
                          <User className="h-16 w-16 text-emerald-300 dark:text-emerald-700" />
                        </div>
                      )}

                      <input
                        ref={profileInputRef}
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, "profileImage")}
                        className="hidden"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => profileInputRef.current?.click()}
                        className="mt-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                      >
                        <Upload className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                        {profileImagePreview ? "Change Image" : "Upload Image"}
                      </Button>

                      <p className="text-xs text-muted-foreground mt-2">
                        Drag & drop or click to upload. Max size: 5MB
                      </p>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="coverImage"
                        className="text-base font-medium"
                      >
                        Cover Image
                      </Label>
                      {coverImagePreview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCoverImage(null);
                            setCoverImagePreview(null);
                          }}
                          className="h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>

                    <div
                      className={cn(
                        "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-all",
                        isDraggingCover
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                          : "border-muted-foreground/25 hover:border-emerald-300 dark:hover:border-emerald-700",
                        coverImagePreview ? "h-64" : "h-40"
                      )}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, "coverImage")}
                      onDragLeave={(e) => handleDragLeave(e, "coverImage")}
                      onDrop={(e) => handleDrop(e, "coverImage")}
                    >
                      {coverImagePreview ? (
                        <div className="relative w-full h-40 rounded-md overflow-hidden">
                          <Image
                            src={coverImagePreview || "/placeholder.svg"}
                            alt="Cover preview"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                          />
                        </div>
                      ) : userData?.coverImage ? (
                        <div className="relative w-full h-32 rounded-md overflow-hidden mb-4">
                          <Image
                            src={userData.coverImage || "/placeholder.svg"}
                            alt="Current cover"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 rounded-md bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mb-4">
                          <ImageIcon className="h-12 w-12 text-emerald-300 dark:text-emerald-700" />
                        </div>
                      )}

                      <input
                        ref={coverInputRef}
                        type="file"
                        id="coverImage"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, "coverImage")}
                        className="hidden"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => coverInputRef.current?.click()}
                        className="mt-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                      >
                        <Upload className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                        {coverImagePreview ? "Change Image" : "Upload Image"}
                      </Button>

                      <p className="text-xs text-muted-foreground mt-2">
                        Drag & drop or click to upload. Max size: 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-emerald-100 dark:bg-emerald-900/30" />

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-200">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="focus-visible:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your username"
                        className="focus-visible:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself"
                      className="min-h-[120px] focus-visible:ring-emerald-500"
                    />
                    <p className="text-xs text-muted-foreground">
                      {bio.length}/500 characters
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="City, Country"
                          className="pl-10 focus-visible:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="pl-10 focus-visible:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      <Input
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="pl-10 focus-visible:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="additional" className="space-y-6 mt-0">
                {/* Social Links */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-200">
                      Social Links
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddSocialLink}
                      className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                    >
                      <Plus className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                      Add Link
                    </Button>
                  </div>

                  {socialLinks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg border-emerald-200 dark:border-emerald-800">
                      <Link className="h-10 w-10 text-emerald-400 dark:text-emerald-600 mb-2" />
                      <p className="text-muted-foreground text-center">
                        No social links added yet. Add your social media
                        profiles to connect with others.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {socialLinks.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center space-x-2"
                        >
                          <Select
                            value={link.platform}
                            onValueChange={(value) =>
                              handleUpdateSocialLink(link.id, "platform", value)
                            }
                          >
                            <SelectTrigger className="w-[140px] focus:ring-emerald-500">
                              <SelectValue placeholder="Platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Twitter">Twitter</SelectItem>
                              <SelectItem value="Facebook">Facebook</SelectItem>
                              <SelectItem value="Instagram">
                                Instagram
                              </SelectItem>
                              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                              <SelectItem value="GitHub">GitHub</SelectItem>
                              <SelectItem value="YouTube">YouTube</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            value={link.url}
                            onChange={(e) =>
                              handleUpdateSocialLink(
                                link.id,
                                "url",
                                e.target.value
                              )
                            }
                            placeholder="https://..."
                            className="flex-1 focus-visible:ring-emerald-500"
                          />

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSocialLink(link.id)}
                            className="h-10 w-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="bg-emerald-100 dark:bg-emerald-900/30" />

                {/* Education */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-200">
                      Education
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddEducation}
                      className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                    >
                      <Plus className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                      Add Education
                    </Button>
                  </div>

                  {education.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg border-emerald-200 dark:border-emerald-800">
                      <School className="h-10 w-10 text-emerald-400 dark:text-emerald-600 mb-2" />
                      <p className="text-muted-foreground text-center">
                        No education history added yet. Add your educational
                        background to showcase your qualifications.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {education.map((edu) => (
                        <div
                          key={edu.id}
                          className="p-4 border rounded-lg space-y-4 border-emerald-100 hover:border-emerald-200 dark:border-emerald-900/50 dark:hover:border-emerald-800"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-emerald-700 dark:text-emerald-300">
                              Education Entry
                            </h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveEducation(edu.id)}
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`school-${edu.id}`}>
                                School/University
                              </Label>
                              <Input
                                id={`school-${edu.id}`}
                                value={edu.school}
                                onChange={(e) =>
                                  handleUpdateEducation(
                                    edu.id,
                                    "school",
                                    e.target.value
                                  )
                                }
                                placeholder="Harvard University"
                                className="focus-visible:ring-emerald-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                              <Input
                                id={`degree-${edu.id}`}
                                value={edu.degree}
                                onChange={(e) =>
                                  handleUpdateEducation(
                                    edu.id,
                                    "degree",
                                    e.target.value
                                  )
                                }
                                placeholder="Bachelor of Science"
                                className="focus-visible:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`field-${edu.id}`}>
                              Field of Study
                            </Label>
                            <Input
                              id={`field-${edu.id}`}
                              value={edu.fieldOfStudy || ""}
                              onChange={(e) =>
                                handleUpdateEducation(
                                  edu.id,
                                  "fieldOfStudy",
                                  e.target.value
                                )
                              }
                              placeholder="Computer Science"
                              className="focus-visible:ring-emerald-500"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`start-${edu.id}`}>
                                Start Year
                              </Label>
                              <Input
                                id={`start-${edu.id}`}
                                value={edu.startYear}
                                onChange={(e) =>
                                  handleUpdateEducation(
                                    edu.id,
                                    "startYear",
                                    e.target.value
                                  )
                                }
                                placeholder="2018"
                                className="focus-visible:ring-emerald-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`end-${edu.id}`}>End Year</Label>
                              <Input
                                id={`end-${edu.id}`}
                                value={edu.endYear}
                                onChange={(e) =>
                                  handleUpdateEducation(
                                    edu.id,
                                    "endYear",
                                    e.target.value
                                  )
                                }
                                placeholder="2022 or Present"
                                className="focus-visible:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`description-${edu.id}`}>
                              Description
                            </Label>
                            <Textarea
                              id={`description-${edu.id}`}
                              value={edu.description || ""}
                              onChange={(e) =>
                                handleUpdateEducation(
                                  edu.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Brief description of your studies, achievements, etc."
                              className="focus-visible:ring-emerald-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="bg-emerald-100 dark:bg-emerald-900/30" />

                {/* Work Experience */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-200">
                      Work Experience
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddWorkExperience}
                      className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                    >
                      <Plus className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                      Add Experience
                    </Button>
                  </div>

                  {workExperience.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg border-emerald-200 dark:border-emerald-800">
                      <Briefcase className="h-10 w-10 text-emerald-400 dark:text-emerald-600 mb-2" />
                      <p className="text-muted-foreground text-center">
                        No work experience added yet. Add your professional
                        experience to showcase your career.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {workExperience.map((work) => (
                        <div
                          key={work.id}
                          className="p-4 border rounded-lg space-y-4 border-emerald-100 hover:border-emerald-200 dark:border-emerald-900/50 dark:hover:border-emerald-800"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-emerald-700 dark:text-emerald-300">
                              Work Experience Entry
                            </h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveWorkExperience(work.id)
                              }
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`company-${work.id}`}>
                                Company
                              </Label>
                              <Input
                                id={`company-${work.id}`}
                                value={work.company}
                                onChange={(e) =>
                                  handleUpdateWorkExperience(
                                    work.id,
                                    "company",
                                    e.target.value
                                  )
                                }
                                placeholder="Google"
                                className="focus-visible:ring-emerald-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`position-${work.id}`}>
                                Position
                              </Label>
                              <Input
                                id={`position-${work.id}`}
                                value={work.position}
                                onChange={(e) =>
                                  handleUpdateWorkExperience(
                                    work.id,
                                    "position",
                                    e.target.value
                                  )
                                }
                                placeholder="Software Engineer"
                                className="focus-visible:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`location-${work.id}`}>
                              Location
                            </Label>
                            <Input
                              id={`location-${work.id}`}
                              value={work.location || ""}
                              onChange={(e) =>
                                handleUpdateWorkExperience(
                                  work.id,
                                  "location",
                                  e.target.value
                                )
                              }
                              placeholder="Mountain View, CA"
                              className="focus-visible:ring-emerald-500"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`start-date-${work.id}`}>
                                Start Date
                              </Label>
                              <Input
                                id={`start-date-${work.id}`}
                                value={work.startDate}
                                onChange={(e) =>
                                  handleUpdateWorkExperience(
                                    work.id,
                                    "startDate",
                                    e.target.value
                                  )
                                }
                                placeholder="2018-01-01"
                                className="focus-visible:ring-emerald-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`end-date-${work.id}`}>
                                End Date
                              </Label>
                              <Input
                                id={`end-date-${work.id}`}
                                value={work.endDate}
                                onChange={(e) =>
                                  handleUpdateWorkExperience(
                                    work.id,
                                    "endDate",
                                    e.target.value
                                  )
                                }
                                placeholder="2022-01-01 or Present"
                                className="focus-visible:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`description-${work.id}`}>
                              Description
                            </Label>
                            <Textarea
                              id={`description-${work.id}`}
                              value={work.description || ""}
                              onChange={(e) =>
                                handleUpdateWorkExperience(
                                  work.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Brief description of your responsibilities and achievements"
                              className="focus-visible:ring-emerald-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="bg-emerald-100 dark:bg-emerald-900/30" />

                {/* Skills */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-200">
                      Skills
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddSkill}
                      className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                    >
                      <Plus className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                      Add Skill
                    </Button>
                  </div>

                  {skills.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg border-emerald-200 dark:border-emerald-800">
                      <FileText className="h-10 w-10 text-emerald-400 dark:text-emerald-600 mb-2" />
                      <p className="text-muted-foreground text-center">
                        No skills added yet. Add your skills to showcase your
                        expertise.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center space-x-2"
                        >
                          <Input
                            value={skill.name}
                            onChange={(e) =>
                              handleUpdateSkill(
                                skill.id,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Skill name"
                            className="flex-1 focus-visible:ring-emerald-500"
                          />

                          <Select
                            value={skill.level || "Intermediate"}
                            onValueChange={(value) =>
                              handleUpdateSkill(skill.id, "level", value)
                            }
                          >
                            <SelectTrigger className="w-[140px] focus:ring-emerald-500">
                              <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">
                                Intermediate
                              </SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="Expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSkill(skill.id)}
                            className="h-10 w-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="bg-emerald-100 dark:bg-emerald-900/30" />

                {/* Interests */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-200">
                    Interests
                  </h3>

                  <div className="flex items-center space-x-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add an interest"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInterest();
                        }
                      }}
                      className="focus-visible:ring-emerald-500"
                    />
                    <Button
                      onClick={handleAddInterest}
                      disabled={!newInterest.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {interests.length === 0 ? (
                      <p className="text-muted-foreground">
                        No interests added yet. Add your interests to connect
                        with like-minded people.
                      </p>
                    ) : (
                      interests.map((interest, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100"
                        >
                          {interest}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveInterest(interest)}
                            className="h-4 w-4 p-0 ml-1 text-emerald-700 hover:text-rose-600 dark:text-emerald-300 dark:hover:text-rose-400"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6 mt-0">
                {/* Change Password */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-200">
                    Change Password
                  </h3>

                  {passwordError && (
                    <div className="bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 p-3 rounded-md flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <p>{passwordError}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            setPasswordError(null);
                          }}
                          placeholder="Enter your current password"
                          className="pr-10 focus-visible:ring-emerald-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setPasswordError(null);
                          }}
                          placeholder="Enter your new password"
                          className="pr-10 focus-visible:ring-emerald-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </Button>
                      </div>
                      <ReactPasswordStrengthBar
                        password={newPassword}
                        scoreWords={[
                          "Weak",
                          "Okay",
                          "Good",
                          "Strong",
                          "Very Strong",
                        ]}
                        shortScoreWord="Too Short"
                        scoreWordStyle={{
                          color: theme === "dark" ? "#ffffff" : "#000000",
                        }}
                        barColors={[
                          "#ddd",
                          "#ef4836",
                          "#f6b44d",
                          "#10b981", // emerald-500
                          "#059669", // emerald-600
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmNewPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmNewPassword}
                          onChange={(e) => {
                            setConfirmNewPassword(e.target.value);
                            setPasswordError(null);
                          }}
                          placeholder="Confirm your new password"
                          className="pr-10 focus-visible:ring-emerald-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handlePasswordChange}
                      disabled={
                        saving ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmNewPassword ||
                        newPassword !== confirmNewPassword
                      }
                      className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Key className="mr-2 h-4 w-4" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Separator className="bg-emerald-100 dark:bg-emerald-900/30" />

                {/* Security Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-200">
                    Security Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg border-emerald-100 hover:border-emerald-200 dark:border-emerald-900/50 dark:hover:border-emerald-800">
                      <div>
                        <h4 className="font-medium text-emerald-700 dark:text-emerald-300">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                      >
                        <Lock className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Setup
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg border-emerald-100 hover:border-emerald-200 dark:border-emerald-900/50 dark:hover:border-emerald-800">
                      <div>
                        <h4 className="font-medium text-emerald-700 dark:text-emerald-300">
                          Active Sessions
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Manage devices where you're currently logged in
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                      >
                        <LogOut className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Manage
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg border-emerald-100 hover:border-emerald-200 dark:border-emerald-900/50 dark:hover:border-emerald-800">
                      <div>
                        <h4 className="font-medium text-emerald-700 dark:text-emerald-300">
                          Password Reset
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Send a password reset link to your email
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                      >
                        <RefreshCw className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="account" className="space-y-6 mt-0">
                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-200">
                    Account Information
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg border-emerald-100 hover:border-emerald-200 dark:border-emerald-900/50 dark:hover:border-emerald-800">
                      <div>
                        <h4 className="font-medium text-emerald-700 dark:text-emerald-300">
                          Email Address
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {userData?.email || "email@example.com"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                      >
                        <Mail className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Change
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg border-emerald-100 hover:border-emerald-200 dark:border-emerald-900/50 dark:hover:border-emerald-800">
                      <div>
                        <h4 className="font-medium text-emerald-700 dark:text-emerald-300">
                          Account Type
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Standard Account
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                      >
                        <Briefcase className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Upgrade
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg border-emerald-100 hover:border-emerald-200 dark:border-emerald-900/50 dark:hover:border-emerald-800">
                      <div>
                        <h4 className="font-medium text-emerald-700 dark:text-emerald-300">
                          Account Created
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {userData?.joinedAt
                            ? new Date(userData.joinedAt).toLocaleDateString()
                            : "January 1, 2023"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="bg-emerald-100 dark:bg-emerald-900/30" />

                {/* Privacy Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-200">
                    Privacy Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg border-emerald-100 hover:border-emerald-200 dark:border-emerald-900/50 dark:hover:border-emerald-800">
                      <div>
                        <h4 className="font-medium text-emerald-700 dark:text-emerald-300">
                          Profile Visibility
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Control who can see your profile
                        </p>
                      </div>
                      <Select defaultValue="public">
                        <SelectTrigger className="w-[140px] focus:ring-emerald-500 border-emerald-200 dark:border-emerald-800">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg border-emerald-100 hover:border-emerald-200 dark:border-emerald-900/50 dark:hover:border-emerald-800">
                      <div>
                        <h4 className="font-medium text-emerald-700 dark:text-emerald-300">
                          Email Notifications
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Manage your email notification preferences
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                      >
                        <Settings className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Configure
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg border-emerald-100 hover:border-emerald-200 dark:border-emerald-900/50 dark:hover:border-emerald-800">
                      <div>
                        <h4 className="font-medium text-emerald-700 dark:text-emerald-300">
                          Data Export
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Download a copy of your data
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                      >
                        <Download className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="bg-emerald-100 dark:bg-emerald-900/30" />

                {/* Danger Zone */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-rose-600 dark:text-rose-400">
                    Danger Zone
                  </h3>

                  <div className="p-4 border border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-rose-600 dark:text-rose-400">
                          Delete Account
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all your data
                        </p>
                      </div>
                      <AlertDialog
                        open={showDeleteAccountDialog}
                        onOpenChange={setShowDeleteAccountDialog}
                      >
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your account and remove all
                              your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-rose-200 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-900 dark:hover:border-rose-800 dark:hover:bg-rose-950/30">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-800"
                            >
                              {saving ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                "Delete Account"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>

      {/* Discard Changes Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-rose-200 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-900 dark:hover:border-rose-800 dark:hover:bg-rose-950/30">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDiscardChanges}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditProfile;
