"use client";

import { useState } from "react";
import EnhancedPostBox from "@/components/post/PostForm";
import Feeds from "@/components/post/PostList";
import { RefreshCw, Search, Filter, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PostPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Function to handle adding a new post
  const handleAddPost = (newPost: any) => {
    setPosts([newPost, ...posts]);
    toast({
      title: "Post created!",
      description: "Your post has been published successfully.",
    });
  };

  // Simulate refreshing posts
  const refreshPosts = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Feed refreshed",
        description: "Your feed has been updated with the latest posts.",
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a2e29]">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column - Create Post */}
          <div className="lg:w-1/3">
            <div className="bg-[#0f1a25] rounded-lg overflow-hidden shadow-lg">
              <div className="bg-[#0d9488] p-4">
                <h2 className="text-xl font-bold text-white">Create Post</h2>
                <p className="text-sm text-white/80">
                  Share your thoughts with the community
                </p>
              </div>
              <div>
                <EnhancedPostBox onAddPost={handleAddPost} />
              </div>
            </div>
          </div>

          {/* Right column - Feed */}
          <div className="lg:w-2/3">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-white">Community Feed</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPosts}
                className="border-[#0d9488] text-[#0d9488] hover:bg-[#0d9488]/10"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                <span>Refresh</span>
              </Button>
            </div>

            <div className="bg-[#0f1a25] rounded-lg overflow-hidden shadow-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#0d9488]">
                  Latest Posts
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#0d9488]"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#0d9488]"
                  >
                    <Filter className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#0d9488]"
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <Feeds post={posts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
