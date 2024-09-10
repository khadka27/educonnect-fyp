"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

export default function Navbar1() {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { theme, setTheme } = useTheme();

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
                  src="/placeholder.svg?height=40&width=40"
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
                <span>JohnDoe</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>User Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4 text-red-600 " />
                <span color="red">LogOut</span>
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
