"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, MessageSquare, Edit, Camera } from "lucide-react";
import { useTheme } from "next-themes";
import axios from "axios";
import EditProfile from "@/components/profile/edit-profile";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Avatar from "react-avatar";

const ProfilePage = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const { theme } = useTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleProfileUpdate = async () => {
    await fetchUserData(); // Refresh the user data after edit
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const isDarkMode = theme === "dark";

  function handleImageUpload(
    e: ChangeEvent<HTMLInputElement>,
    isCoverImage: boolean
  ): void {
    console.warn("Image upload functionality is not implemented.");
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-4xl mx-auto p-4">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 rounded-t-lg overflow-hidden">
          <Dialog>
            <DialogTrigger asChild>
              <Image
                src={
                  user?.coverImage || "/placeholder.svg?height=300&width=1200"
                }
                alt="Cover"
                width={1200}
                height={300}
                className="w-full h-full object-cover cursor-pointer"
              />
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <Image
                src={
                  user?.coverImage || "/placeholder.svg?height=300&width=1200"
                }
                alt="Cover Preview"
                width={1200}
                height={300}
                className="w-full h-auto"
              />
            </DialogContent>
          </Dialog>
          <label htmlFor="cover-upload" className="absolute bottom-4 right-4">
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, true)}
            />
            <Button
              size="icon"
              className="rounded-full"
              variant={isDarkMode ? "secondary" : "outline"}
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">Upload cover photo</span>
            </Button>
          </label>
        </div>

        {/* Profile Content */}
        <Card
          className={`mt-[-64px] relative z-10 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="p-6">
            {/* Profile Picture */}
            <div className="absolute top-0 left-6 transform -translate-y-1/2">
              <div className="relative">
                <Dialog>
                  <DialogTrigger>
                    {user?.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt="Profile"
                        width={128}
                        height={128}
                        className={`w-32 h-32 rounded-full border-4 cursor-pointer ${
                          isDarkMode ? "border-gray-800" : "border-white"
                        }`}
                      />
                    ) : (
                      <Avatar
                        name={user?.name || "User"}
                        size="150"
                        round={true}
                      />
                    )}
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    {user?.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt="Profile"
                        width={128}
                        height={128}
                        className={`w-32 h-32 rounded-full border-4 cursor-pointer ${
                          isDarkMode ? "border-gray-800" : "border-white"
                        }`}
                      />
                    ) : (
                      <Avatar
                        name={user?.name || "User"}
                        size="150"
                        round={true}
                      />
                    )}
                  </DialogContent>
                </Dialog>
                <label
                  htmlFor="profile-upload"
                  className="absolute bottom-0 right-0"
                >
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, false)}
                  />
                  <Button
                    size="icon"
                    className="rounded-full"
                    variant={isDarkMode ? "secondary" : "outline"}
                  >
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Upload profile photo</span>
                  </Button>
                </label>
              </div>
            </div>

            {/* User Info */}
            <div className="mt-16 mb-6">
              <h1
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {user?.name || "Please wait..."}
              </h1>
              <p
                className={`text-lg ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {user?.username || "@username"}
              </p>
              <div
                className={`flex items-center mt-2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <MapPin className="w-4 h-4 mr-1" />
                <span>{user?.address || "address"}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                className={`flex-1 ${
                  isDarkMode
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-green-400 hover:bg-green-500"
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={`flex-1 ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[1000px]">
                  <EditProfile
                    user={user}
                    onClose={() => {
                      setIsEditModalOpen(false);
                      handleProfileUpdate(); // Refresh the user data
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Additional User Info */}
            <div
              className={`mt-6 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-2 ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                About
              </h2>
              <p>{user?.bio || "hello i am new user!!!"}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
