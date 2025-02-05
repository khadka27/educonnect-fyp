"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Mail,
  Phone,
  ImageIcon,
  Clock,
  DollarSign,
  Percent,
} from "lucide-react";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Textarea } from "src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "src/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const eventSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().optional(),
  date: yup.date().required("Date is required"),
  startTime: yup.string().required("Start time is required"),
  registrationEndDate: yup.date().required("Registration end date is required"),
  location: yup.string().required("Location is required"),
  type: yup
    .string()
    .oneOf(["free", "premium"], "Type must be free or premium")
    .required("Event type is required"),
  price: yup
    .number()
    .when("type", (type, schema) =>
      type === "premium"
        ? schema
            .required("Price is required for premium events")
            .min(0, "Price must be a positive number")
        : schema.nullable()
    ),
  discountPercentage: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, "Discount percentage must be between 0 and 100")
    .max(100, "Discount percentage must be between 0 and 100")
    .nullable(),
  bannerUrl: yup.string().url("Must be a valid URL").optional(),
  contactEmail: yup
    .string()
    .email("Must be a valid email")
    .required("Contact email is required"),
  contactPhone: yup
    .string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Contact phone is required"),
});

type EventFormValues = yup.InferType<typeof eventSchema>;

export default function CreateEventPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<EventFormValues>({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: undefined,
      startTime: "",
      registrationEndDate: undefined,
      location: "",
      type: "free",
      price: undefined,
      discountPercentage: undefined,
      bannerUrl: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  async function onSubmit(data: EventFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: data.date?.toISOString(),
          startTime: `${data.date?.toISOString().split("T")[0]}T${
            data.startTime
          }:00`,
          registrationEndDate: data.registrationEndDate?.toISOString(),
        }),
      });
      if (response.ok) {
        toast({
          title: "Event created",
          description: "Your event has been successfully created.",
        });
        router.push("/Events");
      } else {
        throw new Error("Failed to create event");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>
            Fill in the details to create a new event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your event" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input
                            type="date"
                            className="pl-10"
                            {...field}
                            value={
                              field.value
                                ? field.value.toISOString().split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input type="time" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="registrationEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration End Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input
                          type="date"
                          className="pl-10"
                          {...field}
                          value={
                            field.value
                              ? field.value.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input
                          placeholder="Event location"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("type") === "premium" && (
                <>
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <Input
                              type="number"
                              placeholder="Event price"
                              className="pl-10"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percentage</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Percent
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <Input
                              type="number"
                              placeholder="Discount %"
                              className="pl-10"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormField
                control={form.control}
                name="bannerUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ImageIcon
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <Input
                          placeholder="https://example.com/banner.jpg"
                          className="pl-10"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setPreviewImage(e.target.value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Provide a URL for your event banner image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {previewImage && (
                <div className="mt-4">
                  <Image
                    src={previewImage}
                    alt="Banner preview"
                    width={300}
                    height={150}
                    className="rounded-md"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input
                            type="email"
                            placeholder="contact@example.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <Input
                            placeholder="1234567890"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Event"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
