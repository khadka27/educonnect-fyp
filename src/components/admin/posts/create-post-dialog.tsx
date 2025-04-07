"use client"

import { useState } from "react"
import axios from "axios"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "src/components/ui/label"
import { Textarea } from "src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select"
import { useAdmin, adminActions } from "@/context/admin-context"
import { Loader2, Upload, X } from 'lucide-react'
import { Input } from "src/components/ui/input"

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreatePostDialog({ open, onOpenChange, onSuccess }: CreatePostDialogProps) {
  const [formData, setFormData] = useState({
    content: "",
    userId: "",
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const { dispatch } = useAdmin()

  // In a real implementation, you would fetch users from the API
  // For now, we'll use mock data
  const mockUsers = [
    { id: "user1", name: "John Doe", email: "john@example.com" },
    { id: "user2", name: "Jane Smith", email: "jane@example.com" },
    { id: "user3", name: "Robert Johnson", email: "robert@example.com" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleUserChange = (value: string) => {
    setFormData((prev) => ({ ...prev, userId: value }))
    if (errors.userId) {
      setErrors((prev) => ({ ...prev, userId: "" }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      
      // Preview the image
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }))
      }
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.content.trim()) {
      newErrors.content = "Content is required"
    }

    if (!formData.userId) {
      newErrors.userId = "User is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    adminActions.setLoading(dispatch, true)

    try {
      // In a real implementation, you would upload the image file
      // and get the URL to include in the post data
      let postUrl = null
      if (image) {
        // Simulate image upload
        postUrl = `/posts/images/${Date.now()}-${image.name}`
      }

      const postData = {
        ...formData,
        postUrl,
      }

      const response = await axios.post("/api/admin/posts", postData)

      // Reset form
      setFormData({
        content: "",
        userId: "",
      })
      setImage(null)
      setImagePreview(null)

      onSuccess()
    } catch (error: any) {
      console.error("Error creating post:", error)

      if (error.response?.data?.error) {
        adminActions.addAlert(dispatch, error.response.data.error, "error")
      } else {
        adminActions.addAlert(dispatch, "Failed to create post", "error")
      }
    } finally {
      setIsSubmitting(false)
      adminActions.setLoading(dispatch, false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>Create a new post for the selected user.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userId">Post as User*</Label>
              <Select value={formData.userId} onValueChange={handleUserChange}>
                <SelectTrigger id="userId" className={errors.userId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {loadingUsers ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    mockUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.userId && <p className="text-sm text-red-500">{errors.userId}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Content*</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="What's on your mind?"
                rows={5}
                className={errors.content ? "border-red-500" : ""}
              />
              {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Add Image</Label>
              <div className="flex items-center gap-2">
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image")?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {image ? image.name : "Choose image"}
                </Button>
                {image && (
                  <Button type="button" variant="ghost" size="sm" onClick={removeImage}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                )}
              </div>
              
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="max-h-40 rounded-md object-contain" />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Post
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
