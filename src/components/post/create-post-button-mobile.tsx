"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import EnhancedPostBox from "@/components/post/PostForm";

export function CreatePostButtonMobile() {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddPost = (newPost: any) => {
    // Handle the new post
    console.log("New post created:", newPost);

    // Close the modal after posting
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Create Button - Fixed at bottom */}
      <Button
        size="icon"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-[#0d9488] hover:bg-[#0b7a70] z-50"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Post Creation Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#0f1a25] border border-[#0d9488] p-0">
          <DialogHeader className="bg-[#0d9488] p-4 sticky top-0 z-10">
            <DialogTitle className="text-white text-xl font-bold">
              Create Post
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <EnhancedPostBox onAddPost={handleAddPost} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
