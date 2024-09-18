"use client";

import { useState, useEffect, ChangeEvent, DragEvent } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Eye, EyeOff } from "lucide-react";
import ReactPasswordStrengthBar from "react-password-strength-bar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "next-themes";

function EditProfile() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [name, setName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [showCurrentPassword, setShowCurrentPassword] =
    useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  // Data updated state to trigger re-render
  const [dataUpdated, setDataUpdated] = useState<boolean>(false);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`/api/user/${session.user.id}`);
          setName(response.data.name || "");
          setBio(response.data.bio || "");
          setAddress(response.data.address || "");
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [session?.user?.id, dataUpdated]);

  const handleSave = async (data: { [key: string]: string | FormData }) => {
    setLoading(true);
    try {
      await axios.put(`/api/user/${session?.user.id}`, data);
      setDataUpdated((prev) => !prev);
      toast({
        title: "Success",
        description: `Information updated successfully`,
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error("Error updating information:", error);
      toast({
        title: "Error",
        description: `Failed to update information`,
        className: "bg-red-500 text-white",
      });
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const handlePersonalInfoSave = () => {
    const data: { [key: string]: string | FormData } = {};
    if (name) data.name = name;
    if (bio) data.bio = bio;
    if (address) data.address = address;
    handleSave(data);
  };

  const handleImageUpload = async (imageType: string) => {
    const file = imageType === "profileImage" ? profileImage : coverImage;
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", imageType);
    if (session?.user?.id) {
      formData.append("userId", session.user.id);
    }

    try {
      const response = await axios.post(`/api/user/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Success",
        description: `${
          imageType === "profileImage" ? "Profile" : "Cover"
        } image updated`,
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update image" });
    }
  };

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "profileImage" | "coverImage"
  ) => {
    const file = e.target.files?.[0] || null;
    if (type === "profileImage") setProfileImage(file);
    if (type === "coverImage") setCoverImage(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (
    e: DragEvent<HTMLDivElement>,
    type: "profileImage" | "coverImage"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (type === "profileImage") setProfileImage(file);
      if (type === "coverImage") setCoverImage(file);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        className: "bg-red-500 text-white",
      });
      return;
    }

    if (newPassword === currentPassword) {
      toast({
        title: "Error",
        description: "New password cannot be the same as the old password",
        className: "bg-red-500 text-white",
      });
      return;
    }

    setLoading(true);

    try {
      await axios.put(`/api/user/${session?.user.id}/change-password`, {
        currentPassword,
        newPassword,
      });
      toast({
        title: "Success",
        description: "Password updated successfully",
        className: "bg-green-500 text-white",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: "Failed to update password",
        className: "bg-red-500 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-green-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[90vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-300">
            Edit Profile
          </CardTitle>
        </CardHeader>
        <ScrollArea className="h-[calc(90vh-4rem)]">
          <CardContent>
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger
                  value="account"
                  className="bg-green-400 text-white hover:bg-green-500 data-[state=active]:bg-green-600"
                >
                  Personal Information
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="bg-green-400 text-white hover:bg-green-500 data-[state=active]:bg-green-600"
                >
                  Change Password
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className="space-y-2 border-2 border-dashed border-green-300 dark:border-green-700 p-4 rounded-lg"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "profileImage")}
                  >
                    <Label htmlFor="profileImage">Profile Image</Label>
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, "profileImage")}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Drag and drop or click to select
                    </p>
                    <Button
                      onClick={() => handleImageUpload("profileImage")}
                      disabled={!profileImage || loading}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload Profile Image
                    </Button>
                  </div>
                  <div
                    className="space-y-2 border-2 border-dashed border-green-300 dark:border-green-700 p-4 rounded-lg"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, "coverImage")}
                  >
                    <Label htmlFor="coverImage">Cover Image</Label>
                    <Input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, "coverImage")}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Drag and drop or click to select
                    </p>
                    <Button
                      onClick={() => handleImageUpload("coverImage")}
                      disabled={!coverImage || loading}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload Cover Image
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="bg-green-50 dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={!isEditing}
                    className="bg-green-50 dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={!isEditing}
                    className="bg-green-50 dark:bg-gray-800"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => setIsEditing(true)}
                    disabled={loading || isEditing}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={handlePersonalInfoSave}
                    disabled={loading || !isEditing}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="password" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-green-50 dark:bg-gray-800 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
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
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-green-50 dark:bg-gray-800 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
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
                      "#2b90ef",
                      "#25c281",
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
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="bg-green-50 dark:bg-gray-800 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handlePasswordChange}
                  disabled={
                    loading ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmNewPassword
                  }
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}

export default EditProfile;
