"use client";

import EditProfile from "@/components/profile/edit-profile";

export default function EditProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <EditProfile
        userData={{
          bio: "",
          address: "",
          profileImage: "",
          coverImage: "",
        }}
      />
    </div>
  );
}
