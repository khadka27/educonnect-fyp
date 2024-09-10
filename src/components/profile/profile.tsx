import { Button } from "@/components/ui/button";
import { MapPin, MessageSquare, Edit } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  return (
    <div className="w-full max-w-[90%] mx-auto bg-background">
      <div className="relative">
        {/* Cover Image */}
        <Image
          src="/placeholder.svg?height=300&width=1200"
          alt="Cover"
          width={1200}
          height={300}
          className="w-full h-64 sm:h-80 object-cover"
        />
        {/* Profile Image */}
        <Image
          src="/placeholder.svg?height=160&width=160"
          alt="Profile"
          width={160}
          height={160}
          className="absolute bottom-0 left-8 transform translate-y-1/2 w-32 h-32 rounded-full border-4 border-background"
        />
      </div>
      <div className="pt-20 px-8 pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Jane Doe</h1>
          <p className="text-xl text-muted-foreground">@janedoe</p>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="w-5 h-5 mr-2" />
            <span className="text-lg">New York, USA</span>
          </div>
        </div>
        <div className="flex space-x-2 mt-4">
          <Button className="flex-1">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </Button>
          <Button variant="outline">
            <Edit className="w-4 h-4" /> Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
