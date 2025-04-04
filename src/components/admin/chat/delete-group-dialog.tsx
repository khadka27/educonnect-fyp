"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

interface Group {
  id: string
  name: string
  _count?: {
    messages: number
    members: number
  }
}

interface DeleteGroupDialogProps {
  group: Group
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteGroupDialog({ group, open, onOpenChange, onSuccess }: DeleteGroupDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      // The actual delete operation is handled in the parent component
      onSuccess()
    } catch (error) {
      console.error("Error in delete dialog:", error)
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  // Check if group has messages or members
  const hasMessages = group._count && group._count.messages > 0
  const hasMembers = group._count && group._count.members > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the group <span className="font-medium">"{group.name}"</span> and all
            associated data.
            {(hasMessages || hasMembers) && (
              <div className="mt-2 rounded-md bg-amber-50 p-2 text-amber-800">
                <p className="font-medium">Warning:</p>
                <ul className="ml-4 list-disc">
                  {hasMessages && <li>This group has {group._count?.messages} messages that will be deleted.</li>}
                  {hasMembers && <li>This group has {group._count?.members} members that will be removed.</li>}
                </ul>
              </div>
            )}
            <p className="mt-2">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

