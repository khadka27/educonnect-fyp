import { User, Settings, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu"
import Link from "next/link"
import { signOut } from "next-auth/react"

interface UserProfileDropdownProps {
  user: {
    id: string;
    profileImage?: string;
    name?: string;
    username?: string;
  };
}

const UserProfileDropdown = ({ user }: UserProfileDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex text-sm rounded-full">
          <Avatar>
            <AvatarImage src={user?.profileImage || "/default-profile.png"} alt="Profile" />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href={`/user-profile/${user?.id || ""}`} legacyBehavior>
            <a className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>{user?.username || "Profile"}</span>
            </a>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserProfileDropdown

