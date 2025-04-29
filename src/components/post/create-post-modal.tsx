"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import EnhancedPostBox from "@/components/post/PostForm"

export function CreatePostModal() {
  const [isOpen, setIsOpen] = useState(false)

  const handleAddPost = (newPost: any) => {
    // Handle the new post (you can pass this function down from parent if needed)
    console.log("New post created:", newPost)

    // Close the modal after posting
    setIsOpen(false)
  }

  return (
    <TooltipProvider>
      {/* Create Post Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" className="hidden md:flex" onClick={() => setIsOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </TooltipTrigger>
        <TooltipContent>Create a new post</TooltipContent>
      </Tooltip>

      {/* Post Creation Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#0f1a25] border border-[#0d9488] p-0">
          <DialogHeader className="bg-[#0d9488] p-4 sticky top-0 z-10">
            <DialogTitle className="text-white text-xl font-bold">Create Post</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <EnhancedPostBox onAddPost={handleAddPost} />
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
