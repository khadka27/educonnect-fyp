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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAdmin, adminActions } from "@/context/admin-context"
import { Loader2, Upload } from "lucide-react"

// Book categories
const BOOK_CATEGORIES = [
  "FICTION",
  "NON_FICTION",
  "SCIENCE",
  "TECHNOLOGY",
  "HISTORY",
  "BIOGRAPHY",
  "SELF_HELP",
  "EDUCATION",
  "REFERENCE",
]

interface Book {
  id: string
  title: string
  author: string
  description: string | null
  isbn: string | null
  category: string | null
  publishedYear: number | null
  imageUrl: string | null
  fileUrl: string | null
}

interface EditBookDialogProps {
  book: Book
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditBookDialog({ book, open, onOpenChange, onSuccess }: EditBookDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    isbn: "",
    category: "",
    publishedYear: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { dispatch } = useAdmin()

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        description: book.description || "",
        isbn: book.isbn || "",
        category: book.category || "",
        publishedYear: book.publishedYear ? book.publishedYear.toString() : "",
      })
    }
  }, [book])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }))
      }
    }
  }

  const handleBookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBookFile(e.target.files[0])
      if (errors.bookFile) {
        setErrors((prev) => ({ ...prev, bookFile: "" }))
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author is required"
    }

    if (formData.publishedYear) {
      const year = Number.parseInt(formData.publishedYear)
      if (isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
        newErrors.publishedYear = "Invalid year"
      }
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
      // Create FormData for file upload
      const submitData = new FormData()

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value)
      })

      // Add files if present
      if (imageFile) submitData.append("image", imageFile)
      if (bookFile) submitData.append("bookFile", bookFile)

      const response = await axios.put(`/api/admin/books/${book.id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      onSuccess()
    } catch (error: any) {
      console.error("Error updating book:", error)

      if (error.response?.data?.error) {
        adminActions.addAlert(dispatch, error.response.data.error, "error")
      } else {
        adminActions.addAlert(dispatch, "Failed to update book", "error")
      }
    } finally {
      setIsSubmitting(false)
      adminActions.setLoading(dispatch, false)
    }
  }

  // Format category for display
  const formatCategory = (category: string) => {
    return category.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>Update book information and files.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title*</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-author">Author*</Label>
                <Input
                  id="edit-author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className={errors.author ? "border-red-500" : ""}
                />
                {errors.author && <p className="text-sm text-red-500">{errors.author}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-isbn">ISBN</Label>
                <Input id="edit-isbn" name="isbn" value={formData.isbn} onChange={handleChange} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-publishedYear">Published Year</Label>
                <Input
                  id="edit-publishedYear"
                  name="publishedYear"
                  value={formData.publishedYear}
                  onChange={handleChange}
                  className={errors.publishedYear ? "border-red-500" : ""}
                />
                {errors.publishedYear && <p className="text-sm text-red-500">{errors.publishedYear}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {BOOK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {formatCategory(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Cover Image</Label>
                <div className="flex items-center gap-2">
                  <Input id="edit-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("edit-image")?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {imageFile ? imageFile.name : "Replace image"}
                  </Button>
                </div>
                {book.imageUrl && (
                  <p className="text-xs text-muted-foreground">Current image: {book.imageUrl.split("/").pop()}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-bookFile">Book File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-bookFile"
                    type="file"
                    accept=".pdf,.epub,.mobi"
                    onChange={handleBookFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("edit-bookFile")?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {bookFile ? bookFile.name : "Replace file"}
                  </Button>
                </div>
                {book.fileUrl && (
                  <p className="text-xs text-muted-foreground">Current file: {book.fileUrl.split("/").pop()}</p>
                )}
              </div>
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

