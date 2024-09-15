/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { FaSpinner } from "react-icons/fa"; // Loading icon
import PasswordStrengthBar from "react-password-strength-bar";
import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";
import bcrypt from "bcryptjs";

function EditProfile() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [name, setName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

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
  }, [session?.user?.id, dataUpdated]); // Depend on dataUpdated for re-fetching

  const handleSave = async (data: { [key: string]: string | FormData }) => {
    setLoading(true);
    try {
      await axios.put(`/api/user/${session?.user.id}`, data);

      // Trigger re-render by updating state
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
      setShowDialog(false); // Close the dialog
    }
  };

  const handlePersonalInfoSave = () => {
    const data: { [key: string]: string | FormData } = {};
    if (name) data.name = name;
    if (bio) data.bio = bio;
    if (address) data.address = address;
    handleSave(data);
    setIsEditing(false);
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
      const response = await axios.get(`/api/user/${session?.user.id}`);
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        response.data.password
      );

      if (!isPasswordValid) {
        toast({
          title: "Error",
          description: "Incorrect current password",
          className: "bg-red-500 text-white",
        });
        setLoading(false);
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await axios.put(`/api/user/${session?.user.id}`, {
        password: hashedPassword,
      });
      toast({
        title: "Success",
        description: "Password updated successfully",
        className: "bg-green-500 text-white",
      });
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
    <Tabs defaultValue="account" className="w-full max-w-4xl mx-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="account"
          className="bg-green-400 text-white hover:bg-green-300"
        >
          Personal Information
        </TabsTrigger>
        <TabsTrigger
          value="password"
          className="bg-green-400 text-white hover:bg-green-300"
        >
          Change Password
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profileImage">Profile Image</Label>
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "profileImage")}
                />
                <Button
                  onClick={() => handleImageUpload("profileImage")}
                  disabled={!profileImage}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Upload Profile Image"
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image</Label>
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "coverImage")}
                />
                <Button
                  onClick={() => handleImageUpload("coverImage")}
                  disabled={!coverImage}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Upload Cover Image"
                  )}
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => setIsEditing(true)}
              disabled={loading || isEditing}
            >
              Edit
            </Button>
            <Button
              onClick={handlePersonalInfoSave}
              disabled={loading || !isEditing}
            >
              {loading ? <FaSpinner className="animate-spin" /> : "Save"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordStrength(
                    newPassword.length > 0 ? e.target.value.length : 0
                  );
                }}
              />
              <PasswordStrengthBar password={newPassword} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handlePasswordChange}
              disabled={
                loading || newPassword === "" || confirmNewPassword === ""
              }
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                "Change Password"
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default EditProfile;
