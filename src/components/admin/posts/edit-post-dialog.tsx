"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { useAdmin, adminActions } from "@/context/admin-context"
import { Loader2, Upload, X } from "lucide-react"
import { Input } from "src/components/ui/input"

interface Post {
  id: string
  content: string
  postUrl: string | null
  userId: string
  user: {
    name: string
    username: string
  }
}

interface EditPostDialogProps {
  post: Post
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditPostDialog({ post, open, onOpenChange, onSuccess }: EditPostDialogProps) {
  const [formData, setFormData] = useState({
    content: "",
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { dispatch } = useAdmin()

  useEffect(() => {
    if (post) {
      setFormData({
        content: post.content,
      })
      setImagePreview(post.postUrl)
      setRemoveCurrentImage(false)
    }
  }, [post])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setRemoveCurrentImage(false)

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

  const handleRemoveImage = () => {
    setImage(null)
    setImagePreview(null)
    setRemoveCurrentImage(true)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.content.trim()) {
      newErrors.content = "Content is required"
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
      let postUrl = removeCurrentImage ? null : post.postUrl

      if (image) {
        // Simulate image upload
        postUrl = `/posts/images/${Date.now()}-${image.name}`
      }

      const postData = {
        ...formData,
        postUrl,
      }

      const response = await axios.put(`/api/admin/posts/${post.id}`, postData)

      onSuccess()
    } catch (error: any) {
      console.error("Error updating post:", error)

      if (error.response?.data?.error) {
        adminActions.addAlert(dispatch, error.response.data.error, "error")
      } else {
        adminActions.addAlert(dispatch, "Failed to update post", "error")
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
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Edit post by {post.user.name} (@{post.user.username})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-content">Content*</Label>
              <Textarea
                id="edit-content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={5}
                className={errors.content ? "border-red-500" : ""}
              />
              {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-image">Image</Label>
              <div className="flex items-center gap-2">
                <Input id="edit-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("edit-image")?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {image ? image.name : "Replace image"}
                </Button>

                {(imagePreview || image) && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleRemoveImage}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                )}
              </div>

              {imagePreview && !removeCurrentImage && (
                <div className="mt-2">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="max-h-40 rounded-md object-contain"
                  />
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

