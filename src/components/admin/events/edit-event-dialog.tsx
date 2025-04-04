"use client";

import type React from "react";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  startTime: string | null;
  registrationEndDate: string | null;
  location: string;
  type: "FREE" | "PREMIUM";
  bannerUrl: string | null;
  contactEmail: string;
  contactPhone: string;
  price: number | null;
  discountPercentage: number | null;
}

interface EditEventDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditEventDialog({
  event,
  open,
  onOpenChange,
  onSuccess,
}: EditEventDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
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

  useEffect(() => {
    if (event) {
      // Format the date strings for the form inputs
      const eventDate = format(new Date(event.date), "yyyy-MM-dd");

      // Extract time from startTime if available
      let startTime = "";
      if (event.startTime) {
        startTime = format(new Date(event.startTime), "HH:mm");
      }

      // Format registration end date if available
      let regEndDate = "";
      if (event.registrationEndDate) {
        regEndDate = format(new Date(event.registrationEndDate), "yyyy-MM-dd");
      }

      setFormData({
        title: event.title,
        description: event.description || "",
        date: eventDate,
        startTime: startTime,
        registrationEndDate: regEndDate,
        location: event.location,
        type: event.type,
        contactEmail: event.contactEmail,
        contactPhone: event.contactPhone,
        price: event.price ? event.price.toString() : "",
        discountPercentage: event.discountPercentage
          ? event.discountPercentage.toString()
          : "",
      });
    }
  }, [event]);

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
        isNaN(Number.parseFloat(formData.price)) ||
        Number.parseFloat(formData.price) <= 0
      ) {
        newErrors.price = "Price must be a positive number";
      }
    }

    // Discount validation
    if (formData.discountPercentage) {
      const discount = Number.parseFloat(formData.discountPercentage);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        newErrors.discountPercentage = "Discount must be between 0 and 100";
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
        price:
          formData.type === "PREMIUM"
            ? Number.parseFloat(formData.price)
            : null,
        discountPercentage: formData.discountPercentage
          ? Number.parseFloat(formData.discountPercentage)
          : null,
        startTime: formData.startTime
          ? `${formData.date}T${formData.startTime}:00`
          : null,
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

      const response = await axios.put(
        `/api/admin/events/${event.id}`,
        eventData
      );

      onSuccess();
    } catch (error: any) {
      console.error("Error updating event:", error);

      if (error.response?.data?.error) {
        adminActions.addAlert(dispatch, error.response.data.error, "error");
      } else {
        adminActions.addAlert(dispatch, "Failed to update event", "error");
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
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update event information and settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Event Title*</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Event Date*</Label>
                <div className="flex">
                  <Calendar className="mr-2 h-4 w-4 mt-3" />
                  <Input
                    id="edit-date"
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
                <Label htmlFor="edit-startTime">Start Time</Label>
                <Input
                  id="edit-startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-registrationEndDate">
                  Registration End Date
                </Label>
                <Input
                  id="edit-registrationEndDate"
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
                <Label htmlFor="edit-location">Location*</Label>
                <Input
                  id="edit-location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Event Type*</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger id="edit-type">
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
                  <Label htmlFor="edit-price">Price (₹)*</Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price}</p>
                  )}
                </div>
              )}

              {formData.type === "PREMIUM" && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-discountPercentage">Discount (%)</Label>
                  <Input
                    id="edit-discountPercentage"
                    name="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={handleChange}
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
                <Label htmlFor="edit-contactEmail">Contact Email*</Label>
                <Input
                  id="edit-contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className={errors.contactEmail ? "border-red-500" : ""}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-500">{errors.contactEmail}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-contactPhone">Contact Phone*</Label>
                <Input
                  id="edit-contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className={errors.contactPhone ? "border-red-500" : ""}
                />
                {errors.contactPhone && (
                  <p className="text-sm text-red-500">{errors.contactPhone}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-banner">Event Banner</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-banner"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("edit-banner")?.click()
                  }
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {bannerFile ? bannerFile.name : "Replace banner image"}
                </Button>
              </div>
              {event.bannerUrl && !bannerFile && (
                <p className="text-xs text-muted-foreground">
                  Current banner: {event.bannerUrl.split("/").pop()}
                </p>
              )}
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
