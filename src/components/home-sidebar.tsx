import { ProfileCard } from "src/components/profile-card";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Users,
  MessageSquare,
  Calendar,
  Bell,
  Bookmark,
  Settings,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

export function HomeSidebar() {
  return (
    <div className="space-y-4">
      <ProfileCard />

      {/* Navigation Menu */}
      <Card className="bg-white/90 dark:bg-gray-800/90 border-emerald-100 dark:border-emerald-900/50">
        <CardContent className="p-3">
          <nav className="space-y-1">
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <Link href="/library" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Library
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <Link href="/news" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                News
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <Link href="/community" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Community
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <Link href="/messages" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <Link href="/events" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Events
              </Link>
            </Button>
          </nav>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="bg-white/90 dark:bg-gray-800/90 border-emerald-100 dark:border-emerald-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center text-emerald-700 dark:text-emerald-300">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="group cursor-pointer">
              <p className="text-sm font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                #DigitalLearning
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                1.2k posts
              </p>
            </div>
            <div className="group cursor-pointer">
              <p className="text-sm font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                #OnlineEducation
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                856 posts
              </p>
            </div>
            <div className="group cursor-pointer">
              <p className="text-sm font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                #RemoteLearning
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                743 posts
              </p>
            </div>
            <div className="group cursor-pointer">
              <p className="text-sm font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                #EdTech
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                621 posts
              </p>
            </div>
          </div>
          <Button
            variant="link"
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 p-0 h-auto mt-2"
          >
            See more topics
          </Button>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="bg-white/90 dark:bg-gray-800/90 border-emerald-100 dark:border-emerald-900/50">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <Link href="/notifications">
                <Bell className="mr-1 h-3 w-3" />
                Notifications
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <Link href="/bookmarks">
                <Bookmark className="mr-1 h-3 w-3" />
                Bookmarks
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <Link href="/settings">
                <Settings className="mr-1 h-3 w-3" />
                Settings
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <Link href="/help">
                <HelpCircle className="mr-1 h-3 w-3" />
                Help
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
        <p>© 2023 EduConnect</p>
        <div className="flex flex-wrap gap-x-2 mt-1">
          <Link
            href="/terms"
            className="hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            Privacy
          </Link>
          <Link
            href="/cookies"
            className="hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            Cookies
          </Link>
        </div>
      </div>
    </div>
  );
}
