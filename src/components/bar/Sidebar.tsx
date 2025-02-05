"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";
import { Button } from "src/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "src/components/ui/sheet";
import {
  Home,
  Globe,
  MessageCircle,
  Bell,
  Users,
  Calendar,
  Settings,
  PenSquare,
  FileText,
  Upload,
  Bookmark,
  LogOut,
  Menu,
} from "lucide-react";
import type React from "react";
import { Switch } from "src/components/ui/switch";
import { useUser } from "src/hooks/useUser";

export default function SidebarNavigation() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const userId = "someUserId"; // Replace with actual user ID
  const { user } = useUser(userId);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className="relative h-full">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-rose-50 dark:from-gray-900 dark:to-gray-800" />

      {/* Frosted glass effect */}
      <div className="absolute inset-0 backdrop-blur-xl" />

      {/* Content */}
      <div className="relative h-full flex flex-col p-4">
        {/* User profile */}
        <div className="flex items-center gap-3 mb-8">
          <Avatar>
            <AvatarImage src={user?.profileImage || "/placeholder.svg"} />
            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {user?.name || "Guest"}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email || "Not signed in"}
            </span>
          </div>
        </div>

        {/* Main navigation */}
        <nav className="flex-1">
          <ul className="space-y-1">
            <NavItem icon={<Home size={20} />} label="Home" href="/" />
            <NavItem
              icon={<Globe size={20} />}
              label="Explore"
              href="/explore"
            />
            <NavItem
              icon={<MessageCircle size={20} />}
              label="Messages"
              href="/chat"
            />
            <NavItem
              icon={<Bell size={20} />}
              label="Notifications"
              href="/notifications"
            />
            <NavItem
              icon={<Users size={20} />}
              label="Community"
              href="/community"
            />
            <NavItem
              icon={<Calendar size={20} />}
              label="Events"
              href="/Events"
            />
            <NavItem
              icon={<Settings size={20} />}
              label="Settings"
              href="/settings"
            />
          </ul>

          <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

          <ul className="space-y-1">
            <NavItem
              icon={<PenSquare size={20} />}
              label="Create Post"
              href="/posts"
            />
            <NavItem
              icon={<FileText size={20} />}
              label="Drafts"
              href="/drafts"
            />
            <NavItem
              icon={<Upload size={20} />}
              label="Upload"
              href="/upload"
            />
            <NavItem
              icon={<Bookmark size={20} />}
              label="Bookmarks"
              href="/bookmarks"
            />
          </ul>
        </nav>

        {/* Footer */}
        <div className="mt-auto">
          {user && (
            <NavItem
              icon={<LogOut size={20} />}
              label="Sign Out"
              onClick={handleSignOut}
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen w-64 fixed left-0 top-0">
        <SidebarContent />
      </div>
    </>
  );
}

function NavItem({
  icon,
  label,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <li>
      <a
        href={href}
        onClick={handleClick}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors ${
          isActive ? "bg-gray-100/50 dark:bg-gray-700/50" : ""
        }`}
      >
        {icon}
        <span>{label}</span>
      </a>
    </li>
  );
}
