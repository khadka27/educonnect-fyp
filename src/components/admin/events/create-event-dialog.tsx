"use client";

import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Textarea } from "src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { useAdmin, adminActions } from "@/context/admin-context";
import { Loader2, Upload, Calendar } from "lucide-react";
import { format } from "date-fns";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateEventDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateEventDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "",
    registrationEndDate: "",
    location: "",
    type: "FREE",
    contactEmail: "",
    contactPhone: "",
    price: "",
    discountPercentage: "",
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { dispatch } = useAdmin();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
    // Clear price error if type is changed to FREE
    if (value === "FREE" && errors.price) {
      setErrors((prev) => ({ ...prev, price: "" }));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
      if (errors.banner) {
        setErrors((prev) => ({ ...prev, banner: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    const requiredFields = [
      { key: "title", label: "Title" },
      { key: "date", label: "Date" },
      { key: "location", label: "Location" },
      { key: "contactEmail", label: "Contact Email" },
      { key: "contactPhone", label: "Contact Phone" },
    ];

    requiredFields.forEach((field) => {
      if (!formData[field.key as keyof typeof formData].trim()) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    // Email validation
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Invalid email address";
    }

    // Phone validation
    if (
      formData.contactPhone &&
      !/^\d{10}$/.test(formData.contactPhone.replace(/[^0-9]/g, ""))
    ) {
      newErrors.contactPhone = "Invalid phone number";
    }

    // Price validation for PREMIUM events
    if (formData.type === "PREMIUM") {
      if (!formData.price) {
        newErrors.price = "Price is required for premium events";
      } else if (
        isNaN(parseFloat(formData.price)) ||
        parseFloat(formData.price) <= 0
      ) {
        newErrors.price = "Price must be a positive number";
      }
    }

    // Discount validation
    if (formData.discountPercentage) {
      const discount = parseFloat(formData.discountPercentage);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        newErrors.discountPercentage = "Discount must be between 0 and 100";
      }
    }

    // Date validation
    if (formData.date) {
      const eventDate = new Date(formData.date);
      if (eventDate < new Date()) {
        newErrors.date = "Event date cannot be in the past";
      }
    }

    // Registration end date validation
    if (formData.registrationEndDate && formData.date) {
      const regEndDate = new Date(formData.registrationEndDate);
      const eventDate = new Date(formData.date);
      if (regEndDate > eventDate) {
        newErrors.registrationEndDate =
          "Registration end date must be before event date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    adminActions.setLoading(dispatch, true);

    try {
      // Prepare data for submission
      const eventData = {
        ...formData,
        price: formData.type === "PREMIUM" ? parseFloat(formData.price) : null,
        discountPercentage: formData.discountPercentage
          ? parseFloat(formData.discountPercentage)
          : null,
        startTime: formData.startTime
          ? `${formData.date}T${formData.startTime}:00`
          : null,
        bannerUrl: null, // Will be updated if banner is uploaded
      };

      // Handle banner upload if present
      if (bannerFile) {
        // In a real implementation, you would upload the file to your storage service
        // and get the URL to include in the event data
        // For now, we'll simulate this
        eventData.bannerUrl = `/events/banners/${Date.now()}-${
          bannerFile.name
        }`;
      }

      const response = await axios.post("/api/admin/events", eventData);

      // Reset form
      setFormData({
        title: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
        startTime: "",
        registrationEndDate: "",
        location: "",
        type: "FREE",
        contactEmail: "",
        contactPhone: "",
        price: "",
        discountPercentage: "",
      });
      setBannerFile(null);

      onSuccess();
    } catch (error: any) {
      console.error("Error creating event:", error);

      if (error.response?.data?.error) {
        adminActions.addAlert(dispatch, error.response.data.error, "error");
      } else {
        adminActions.addAlert(dispatch, "Failed to create event", "error");
      }
    } finally {
      setIsSubmitting(false);
      adminActions.setLoading(dispatch, false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Add a new event to the platform. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title*</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter event description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="date">Event Date*</Label>
                <div className="flex">
                  <Calendar className="mr-2 h-4 w-4 mt-3" />
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={errors.date ? "border-red-500" : ""}
                  />
                </div>
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="registrationEndDate">
                  Registration End Date
                </Label>
                <Input
                  id="registrationEndDate"
                  name="registrationEndDate"
                  type="date"
                  value={formData.registrationEndDate}
                  onChange={handleChange}
                  className={errors.registrationEndDate ? "border-red-500" : ""}
                />
                {errors.registrationEndDate && (
                  <p className="text-sm text-red-500">
                    {errors.registrationEndDate}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location*</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Event location"
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="type">Event Type*</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === "PREMIUM" && (
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (₹)*</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price}</p>
                  )}
                </div>
              )}

              {formData.type === "PREMIUM" && (
                <div className="grid gap-2">
                  <Label htmlFor="discountPercentage">Discount (%)</Label>
                  <Input
                    id="discountPercentage"
                    name="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                    placeholder="0"
                    className={
                      errors.discountPercentage ? "border-red-500" : ""
                    }
                  />
                  {errors.discountPercentage && (
                    <p className="text-sm text-red-500">
                      {errors.discountPercentage}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Contact Email*</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                  className={errors.contactEmail ? "border-red-500" : ""}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-500">{errors.contactEmail}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Contact Phone*</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className={errors.contactPhone ? "border-red-500" : ""}
                />
                {errors.contactPhone && (
                  <p className="text-sm text-red-500">{errors.contactPhone}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="banner">Event Banner</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("banner")?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {bannerFile ? bannerFile.name : "Choose banner image"}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
