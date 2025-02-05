"use client";

import { useState, useEffect } from "react";
import { Button } from "src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "src/components/ui/sheet";
import {
  Moon,
  Sun,
  User,
  Home,
  Calendar,
  Users,
  Menu,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function Sidebar() {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession(); // Use useSession to get session data

  // Extract user info from session
  const user = session?.user;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setIsNavbarVisible(false);
      } else {
        setIsNavbarVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const NavLinks = () => (
    <>
      <Link href="/feeds" className="flex items-center space-x-2">
        <Home className="h-5 w-5" />
        <span>Feeds</span>
      </Link>
      <Link href="/events" className="flex items-center space-x-2">
        <Calendar className="h-5 w-5" />
        <span>Events</span>
      </Link>
      <Link href="/community" className="flex items-center space-x-2">
        <Users className="h-5 w-5" />
        <span>Community</span>
      </Link>
    </>
  );

  return (
    <nav
      className={`fixed w-full bg-green-950 border-b transition-transform duration-300 ${
        isNavbarVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        {/* Left: App Logo */}
        <div className="flex items-center">
          <Image
            src="/onlyLogoeduConnect.png"
            alt="Logo"
            width={40}
            height={40}
            className="h-10 w-10 mr-2"
          />
          <span className="text-xl font-bold hidden sm:inline">MyApp</span>
        </div>

        {/* Center: Navigation Links (hidden on mobile) */}
        <div className="hidden md:flex space-x-6">
          <NavLinks />
        </div>

        {/* Right: Dark mode toggle, Profile, and Mobile Menu */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-10 h-10 rounded-full p-0">
                <Image
                  src={user?.image || "/default-profile.png"} // Default image if user image is not available
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full rounded-full object-cover"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>{user?.name || "JohnDoe"}</span> {/* Display user name */}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/user-profile/${user?.id || ""}`} legacyBehavior>
                  <a className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>User Profile</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  signOut({
                    redirect: false, // Prevent redirect to default NextAuth signOut URL
                  }).then(() => {
                    window.location.reload(); // Reload the page to reflect changes
                  });
                }}
                className="flex items-center text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>LogOut</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
