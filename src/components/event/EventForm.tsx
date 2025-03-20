// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import {
//   Calendar,
//   MapPin,
//   Mail,
//   Phone,
//   ImageIcon,
//   Clock,
//   DollarSign,
//   Percent,
// } from "lucide-react";
// import { Button } from "src/components/ui/button";
// import { Input } from "src/components/ui/input";
// import { Textarea } from "src/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "src/components/ui/select";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "src/components/ui/form";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "src/components/ui/card";
// import { useToast } from "@/hooks/use-toast";

// const eventSchema = yup.object().shape({
//   title: yup.string().required("Title is required"),
//   description: yup.string().optional(),
//   date: yup.date().required("Date is required"),
//   startTime: yup.string().required("Start time is required"),
//   registrationEndDate: yup.date().required("Registration end date is required"),
//   location: yup.string().required("Location is required"),
//   type: yup
//     .string()
//     .oneOf(["free", "premium"], "Type must be free or premium")
//     .required("Event type is required"),
//   price: yup
//     .number()
//     .when("type", (type, schema) =>
//       type === "premium"
//         ? schema
//             .required("Price is required for premium events")
//             .min(0, "Price must be a positive number")
//         : schema.nullable()
//     ),
//   discountPercentage: yup
//     .number()
//     .transform((value) => (isNaN(value) ? undefined : value))
//     .min(0, "Discount percentage must be between 0 and 100")
//     .max(100, "Discount percentage must be between 0 and 100")
//     .nullable(),
//   bannerUrl: yup.string().url("Must be a valid URL").optional(),
//   contactEmail: yup
//     .string()
//     .email("Must be a valid email")
//     .required("Contact email is required"),
//   contactPhone: yup
//     .string()
//     .matches(/^\d{10}$/, "Phone number must be 10 digits")
//     .required("Contact phone is required"),
// });

// type EventFormValues = yup.InferType<typeof eventSchema>;

// export default function CreateEventPage() {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [previewImage, setPreviewImage] = useState<string | null>(null);
//   const router = useRouter();
//   const { toast } = useToast();

//   const form = useForm<EventFormValues>({
//     resolver: yupResolver(eventSchema),
//     defaultValues: {
//       title: "",
//       description: "",
//       date: undefined,
//       startTime: "",
//       registrationEndDate: undefined,
//       location: "",
//       type: "free",
//       price: undefined,
//       discountPercentage: undefined,
//       bannerUrl: "",
//       contactEmail: "",
//       contactPhone: "",
//     },
//   });

//   async function onSubmit(data: EventFormValues) {
//     setIsSubmitting(true);
//     try {
//       const response = await fetch("/api/events", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...data,
//           date: data.date?.toISOString(),
//           startTime: `${data.date?.toISOString().split("T")[0]}T${
//             data.startTime
//           }:00`,
//           registrationEndDate: data.registrationEndDate?.toISOString(),
//         }),
//       });
//       if (response.ok) {
//         toast({
//           title: "Event created",
//           description: "Your event has been successfully created.",
//         });
//         router.push("/Events");
//       } else {
//         throw new Error("Failed to create event");
//       }
//     } catch (error) {
//       console.error(error);
//       toast({
//         title: "Error",
//         description: "Failed to create event. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   return (
//     <div className="container mx-auto py-10">
//       <Card className="w-full max-w-2xl mx-auto">
//         <CardHeader>
//           <CardTitle>Create New Event</CardTitle>
//           <CardDescription>
//             Fill in the details to create a new event.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               <FormField
//                 control={form.control}
//                 name="title"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Event Title</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Enter event title" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Description</FormLabel>
//                     <FormControl>
//                       <Textarea placeholder="Describe your event" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="date"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Date</FormLabel>
//                       <FormControl>
//                         <div className="relative">
//                           <Calendar
//                             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                             size={18}
//                           />
//                           <Input
//                             type="date"
//                             className="pl-10"
//                             {...field}
//                             value={
//                               field.value
//                                 ? field.value.toISOString().split("T")[0]
//                                 : ""
//                             }
//                             onChange={(e) =>
//                               field.onChange(new Date(e.target.value))
//                             }
//                           />
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="startTime"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Start Time</FormLabel>
//                       <FormControl>
//                         <div className="relative">
//                           <Clock
//                             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                             size={18}
//                           />
//                           <Input type="time" className="pl-10" {...field} />
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <FormField
//                 control={form.control}
//                 name="registrationEndDate"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Registration End Date</FormLabel>
//                     <FormControl>
//                       <div className="relative">
//                         <Calendar
//                           className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                           size={18}
//                         />
//                         <Input
//                           type="date"
//                           className="pl-10"
//                           {...field}
//                           value={
//                             field.value
//                               ? field.value.toISOString().split("T")[0]
//                               : ""
//                           }
//                           onChange={(e) =>
//                             field.onChange(new Date(e.target.value))
//                           }
//                         />
//                       </div>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="location"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Location</FormLabel>
//                     <FormControl>
//                       <div className="relative">
//                         <MapPin
//                           className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                           size={18}
//                         />
//                         <Input
//                           placeholder="Event location"
//                           className="pl-10"
//                           {...field}
//                         />
//                       </div>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="type"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Event Type</FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select event type" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="free">Free</SelectItem>
//                         <SelectItem value="premium">Premium</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               {form.watch("type") === "premium" && (
//                 <>
//                   <FormField
//                     control={form.control}
//                     name="price"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Price</FormLabel>
//                         <FormControl>
//                           <div className="relative">
//                             <DollarSign
//                               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                               size={18}
//                             />
//                             <Input
//                               type="number"
//                               placeholder="Event price"
//                               className="pl-10"
//                               {...field}
//                               onChange={(e) =>
//                                 field.onChange(parseFloat(e.target.value))
//                               }
//                             />
//                           </div>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="discountPercentage"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Discount Percentage</FormLabel>
//                         <FormControl>
//                           <div className="relative">
//                             <Percent
//                               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                               size={18}
//                             />
//                             <Input
//                               type="number"
//                               placeholder="Discount %"
//                               className="pl-10"
//                               {...field}
//                               value={field.value ?? ""}
//                               onChange={(e) =>
//                                 field.onChange(parseFloat(e.target.value))
//                               }
//                             />
//                           </div>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </>
//               )}
//               <FormField
//                 control={form.control}
//                 name="bannerUrl"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Banner URL</FormLabel>
//                     <FormControl>
//                       <div className="relative">
//                         <ImageIcon
//                           className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                           size={18}
//                         />
//                         <Input
//                           placeholder="https://example.com/banner.jpg"
//                           className="pl-10"
//                           {...field}
//                           onChange={(e) => {
//                             field.onChange(e);
//                             setPreviewImage(e.target.value);
//                           }}
//                         />
//                       </div>
//                     </FormControl>
//                     <FormDescription>
//                       Provide a URL for your event banner image
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               {previewImage && (
//                 <div className="mt-4">
//                   <Image
//                     src={previewImage}
//                     alt="Banner preview"
//                     width={300}
//                     height={150}
//                     className="rounded-md"
//                   />
//                 </div>
//               )}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="contactEmail"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Contact Email</FormLabel>
//                       <FormControl>
//                         <div className="relative">
//                           <Mail
//                             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                             size={18}
//                           />
//                           <Input
//                             type="email"
//                             placeholder="contact@example.com"
//                             className="pl-10"
//                             {...field}
//                           />
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="contactPhone"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Contact Phone</FormLabel>
//                       <FormControl>
//                         <div className="relative">
//                           <Phone
//                             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                             size={18}
//                           />
//                           <Input
//                             placeholder="1234567890"
//                             className="pl-10"
//                             {...field}
//                           />
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//               <Button type="submit" className="w-full" disabled={isSubmitting}>
//                 {isSubmitting ? "Creating..." : "Create Event"}
//               </Button>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }



"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  MapPin,
  Mail,
  Phone,
  ImageIcon,
  Clock,
  DollarSign,
  Percent,
  Upload,
  X,
  Check,
  Info,
  Globe,
  Users,
  Loader2,
  Save,
} from "lucide-react"
import { Button } from "src/components/ui/button"
import { Input } from "src/components/ui/input"
import { Textarea } from "src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "src/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "src/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "src/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "src/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "src/components/ui/switch"
import { Badge } from "src/components/ui/badge"
import { Separator } from "src/components/ui/separator"
import { Progress } from "src/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const eventSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().optional(),
  date: yup.date().required("Date is required"),
  startTime: yup.string().required("Start time is required"),
  endTime: yup.string().optional(),
  registrationEndDate: yup.date().required("Registration end date is required"),
  location: yup.string().required("Location is required"),
  virtualEvent: yup.boolean().optional(),
  virtualEventLink: yup.string().when("virtualEvent", {
    is: true,
    then: (schema) => schema.required("Virtual event link is required").url("Must be a valid URL"),
    otherwise: (schema) => schema.optional(),
  }),
  type: yup.string().oneOf(["free", "premium"], "Type must be free or premium").required("Event type is required"),
  price: yup
    .number()
    .when("type", (type, schema) =>
      type[0] === "premium"
        ? schema.required("Price is required for premium events").min(0, "Price must be a positive number")
        : schema.nullable(),
    ),
  discountPercentage: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, "Discount percentage must be between 0 and 100")
    .max(100, "Discount percentage must be between 0 and 100")
    .nullable(),
  earlyBirdDiscount: yup.boolean().optional(),
  earlyBirdDeadline: yup.date().when("earlyBirdDiscount", {
    is: true,
    then: (schema) => schema.required("Early bird deadline is required"),
    otherwise: (schema) => schema.optional(),
  }),
  earlyBirdPercentage: yup.number().when("earlyBirdDiscount", {
    is: true,
    then: (schema) =>
      schema
        .required("Early bird percentage is required")
        .min(0, "Percentage must be between 0 and 100")
        .max(100, "Percentage must be between 0 and 100"),
    otherwise: (schema) => schema.optional(),
  }),
  capacity: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(1, "Capacity must be at least 1")
    .nullable(),
  bannerUrl: yup.string().url("Must be a valid URL").optional(),
  contactEmail: yup.string().email("Must be a valid email").required("Contact email is required"),
  contactPhone: yup
    .string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Contact phone is required"),
  tags: yup.array().of(yup.string()).optional(),
  category: yup.string().optional(),
  isPublished: yup.boolean().optional(),
})

type EventFormValues = yup.InferType<typeof eventSchema>

const eventCategories = [
  "Conference",
  "Workshop",
  "Seminar",
  "Networking",
  "Social",
  "Concert",
  "Exhibition",
  "Sports",
  "Charity",
  "Other",
]

export default function CreateEventPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [formProgress, setFormProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [currentTag, setCurrentTag] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<EventFormValues>({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: undefined,
      startTime: "",
      endTime: "",
      registrationEndDate: undefined,
      location: "",
      virtualEvent: false,
      virtualEventLink: "",
      type: "free",
      price: undefined,
      discountPercentage: undefined,
      earlyBirdDiscount: false,
      earlyBirdDeadline: undefined,
      earlyBirdPercentage: undefined,
      capacity: undefined,
      bannerUrl: "",
      contactEmail: "",
      contactPhone: "",
      tags: [],
      category: "",
      isPublished: true,
    },
  })

  // Calculate form completion progress
  useEffect(() => {
    const formValues = form.getValues()
    const requiredFields = [
      "title",
      "date",
      "startTime",
      "registrationEndDate",
      "location",
      "type",
      "contactEmail",
      "contactPhone",
    ]

    const premiumFields = formValues.type === "premium" ? ["price"] : []
    const virtualFields = formValues.virtualEvent ? ["virtualEventLink"] : []
    const earlyBirdFields = formValues.earlyBirdDiscount ? ["earlyBirdDeadline", "earlyBirdPercentage"] : []

    const allRequiredFields = [...requiredFields, ...premiumFields, ...virtualFields, ...earlyBirdFields]

    const completedFields = allRequiredFields.filter((field) => {
      const value = form.getValues(field as any)
      return value !== undefined && value !== "" && value !== null
    })

    const progress = Math.round((completedFields.length / allRequiredFields.length) * 100)
    setFormProgress(progress)
  }, [form.watch(), form])

  // Handle file drop for banner image
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleBannerUpload(e.dataTransfer.files[0])
    }
  }

  const handleBannerUpload = (file: File) => {
    // In a real app, you would upload the file to your server or cloud storage
    // For this demo, we'll simulate an upload and use a local URL
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 300)

    // Create a local URL for the file
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPreviewImage(result)
      form.setValue("bannerUrl", "https://example.com/uploaded-banner.jpg")
    }
    reader.readAsDataURL(file)
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !form.getValues("tags")?.includes(currentTag.trim())) {
      const currentTags = form.getValues("tags") || []
      form.setValue("tags", [...currentTags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || []
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove),
    )
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddTag()
    }
  }

  async function onSubmit(data: EventFormValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: data.date?.toISOString(),
          startTime: `${data.date?.toISOString().split("T")[0]}T${data.startTime}:00`,
          endTime: data.endTime ? `${data.date?.toISOString().split("T")[0]}T${data.endTime}:00` : undefined,
          registrationEndDate: data.registrationEndDate?.toISOString(),
          earlyBirdDeadline: data.earlyBirdDeadline?.toISOString(),
        }),
      })

      if (response.ok) {
        setShowSuccessDialog(true)
      } else {
        throw new Error("Failed to create event")
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const navigateToEvents = () => {
    router.push("/Events")
  }

  const saveAsDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your event has been saved as a draft.",
    })
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
            <p className="text-muted-foreground mt-1">Fill in the details to create and publish your event</p>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview how your event will look</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={saveAsDraft}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save your progress without publishing</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>Create an engaging event for your audience</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{formProgress}% complete</span>
                    <Progress value={formProgress} className="w-24 h-2" />
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="basic" className="flex items-center gap-1">
                      <Info className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline">Basic</span>
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline">Details</span>
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline">Pricing</span>
                    </TabsTrigger>
                    <TabsTrigger value="media" className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline">Media</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <TabsContent value="basic" className="mt-0 space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter a catchy title for your event"
                                {...field}
                                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                              />
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
                              <Textarea
                                placeholder="Describe what your event is about, what attendees can expect, and why they should attend"
                                className="min-h-[120px] resize-y transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Markdown formatting is supported. Be descriptive to attract more attendees.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {eventCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>Categorizing your event helps with discovery</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                          <FormLabel>Tags</FormLabel>
                          <div className="flex items-center gap-2 mb-2">
                            <Input
                              placeholder="Add tags (e.g., music, networking)"
                              value={currentTag}
                              onChange={(e) => setCurrentTag(e.target.value)}
                              onKeyDown={handleTagKeyDown}
                              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleAddTag}
                              disabled={!currentTag.trim()}
                            >
                              Add
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2">
                            <AnimatePresence>
                              {form.watch("tags")?.map((tag) => (
                                <motion.div
                                  key={tag}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Badge className="flex items-center gap-1 px-3 py-1">
                                    <span>{tag}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTag(tag)}
                                      className="text-xs rounded-full hover:bg-primary/20 p-1"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">Tags help attendees find your event</p>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="isPublished"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Publish Event</FormLabel>
                              <FormDescription>
                                Make this event visible to the public immediately after creation
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="details" className="mt-0 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Date</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Calendar
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                    size={18}
                                  />
                                  <Input
                                    type="date"
                                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                    {...field}
                                    value={field.value ? field.value.toISOString().split("T")[0] : ""}
                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="registrationEndDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Registration Deadline</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Calendar
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                    size={18}
                                  />
                                  <Input
                                    type="date"
                                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                    {...field}
                                    value={field.value ? field.value.toISOString().split("T")[0] : ""}
                                    onChange={(e) => field.onChange(new Date(e.target.value))}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>Last day attendees can register</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Clock
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                    size={18}
                                  />
                                  <Input
                                    type="time"
                                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time (Optional)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Clock
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                    size={18}
                                  />
                                  <Input
                                    type="time"
                                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacity (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Users
                                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                  size={18}
                                />
                                <Input
                                  type="number"
                                  placeholder="Maximum number of attendees"
                                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.value === "" ? undefined : Number.parseInt(e.target.value))
                                  }
                                  value={field.value ?? ""}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>Leave empty for unlimited capacity</FormDescription>
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
                                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                  size={18}
                                />
                                <Input
                                  placeholder="Physical location of your event"
                                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                        name="virtualEvent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>This is also a virtual event</FormLabel>
                              <FormDescription>Attendees can join online via a meeting link</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {form.watch("virtualEvent") && (
                        <FormField
                          control={form.control}
                          name="virtualEventLink"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Virtual Event Link</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Globe
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                    size={18}
                                  />
                                  <Input
                                    placeholder="https://zoom.us/j/example"
                                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Zoom, Google Meet, Microsoft Teams, or any other meeting link
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="pricing" className="mt-0 space-y-6">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <FormDescription>
                              Free events are open to all, premium events require payment
                            </FormDescription>
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
                                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                      size={18}
                                    />
                                    <Input
                                      type="number"
                                      placeholder="Event price"
                                      className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                      {...field}
                                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                      value={field.value ?? ""}
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
                                <FormLabel>Discount Percentage (Optional)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Percent
                                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                      size={18}
                                    />
                                    <Input
                                      type="number"
                                      placeholder="Discount %"
                                      className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                      {...field}
                                      value={field.value ?? ""}
                                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>Apply a discount to the ticket price</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="earlyBirdDiscount"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Offer early bird discount</FormLabel>
                                  <FormDescription>Special pricing for early registrations</FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />

                          {form.watch("earlyBirdDiscount") && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="earlyBirdDeadline"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Early Bird Deadline</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Calendar
                                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                          size={18}
                                        />
                                        <Input
                                          type="date"
                                          className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                          {...field}
                                          value={field.value ? field.value.toISOString().split("T")[0] : ""}
                                          onChange={(e) => field.onChange(new Date(e.target.value))}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="earlyBirdPercentage"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Early Bird Discount %</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Percent
                                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                          size={18}
                                        />
                                        <Input
                                          type="number"
                                          placeholder="Early bird discount %"
                                          className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                          {...field}
                                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                          value={field.value ?? ""}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </>
                      )}

                      <div className="rounded-md border p-4 bg-muted/50">
                        <h3 className="font-medium mb-2 flex items-center">
                          <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                          Pricing Information
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Premium events require payment processing setup. Make sure your payment gateway is configured
                          in your account settings.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="media" className="mt-0 space-y-6">
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-lg p-6 text-center transition-all",
                          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                          isUploading && "opacity-50",
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="p-3 rounded-full bg-primary/10">
                            <Upload className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-medium">Upload Event Banner</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                              Drag and drop your image here, or click to browse
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Choose File
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleBannerUpload(e.target.files[0])
                              }
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Recommended size: 1200 x 600 pixels (16:9 ratio)
                          </p>
                        </div>

                        {isUploading && (
                          <div className="mt-4">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-2">Uploading... {uploadProgress}%</p>
                          </div>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name="bannerUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banner URL</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <ImageIcon
                                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                  size={18}
                                />
                                <Input
                                  placeholder="https://example.com/banner.jpg"
                                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    setPreviewImage(e.target.value)
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>Alternatively, provide a URL for your event banner image</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {previewImage && (
                        <div className="mt-4 rounded-md overflow-hidden border">
                          <div className="relative aspect-video">
                            <Image
                              src={previewImage || "/placeholder.svg"}
                              alt="Banner preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-3 bg-muted/30 flex justify-between items-center">
                            <span className="text-sm font-medium">Banner Preview</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPreviewImage(null)
                                form.setValue("bannerUrl", "")
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>

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
                                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                  size={18}
                                />
                                <Input
                                  type="email"
                                  placeholder="contact@example.com"
                                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                  size={18}
                                />
                                <Input
                                  placeholder="1234567890"
                                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-between pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const currentTabIndex = ["basic", "details", "pricing", "media"].indexOf(activeTab)
                          if (currentTabIndex > 0) {
                            setActiveTab(["basic", "details", "pricing", "media"][currentTabIndex - 1])
                          }
                        }}
                        disabled={activeTab === "basic"}
                      >
                        Previous
                      </Button>

                      {activeTab !== "media" ? (
                        <Button
                          type="button"
                          onClick={() => {
                            const currentTabIndex = ["basic", "details", "pricing", "media"].indexOf(activeTab)
                            if (currentTabIndex < 3) {
                              setActiveTab(["basic", "details", "pricing", "media"][currentTabIndex + 1])
                            }
                          }}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Event"
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-1"
              >
                <div className="sticky top-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Event Preview</CardTitle>
                      <CardDescription>How your event will appear to attendees</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-md overflow-hidden border">
                        {previewImage ? (
                          <div className="relative aspect-video">
                            <Image
                              src={previewImage || "/placeholder.svg"}
                              alt="Event banner"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-muted flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold">{form.watch("title") || "Event Title"}</h3>

                        {form.watch("category") && (
                          <Badge variant="outline" className="mt-2">
                            {form.watch("category")}
                          </Badge>
                        )}

                        <div className="flex flex-wrap gap-1 mt-2">
                          {form.watch("tags")?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {form.watch("date") ? new Date(form.watch("date")).toLocaleDateString() : "Event Date"}
                          </span>
                        </div>

                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {form.watch("startTime") || "Start Time"}
                            {form.watch("endTime") && ` - ${form.watch("endTime")}`}
                          </span>
                        </div>

                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{form.watch("location") || "Event Location"}</span>
                        </div>

                        {form.watch("virtualEvent") && (
                          <div className="flex items-center text-sm">
                            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Virtual Event</span>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {form.watch("description") || "No description provided yet."}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2">Pricing</h4>
                        {form.watch("type") === "free" ? (
                          <Badge>Free</Badge>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="font-bold">{form.watch("price") || "0"}</span>

                              {form.watch("discountPercentage") > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                  {form.watch("discountPercentage")}% OFF
                                </Badge>
                              )}
                            </div>

                            {form.watch("earlyBirdDiscount") && (
                              <div className="text-xs text-muted-foreground">
                                Early bird discount: {form.watch("earlyBirdPercentage")}% off until{" "}
                                {form.watch("earlyBirdDeadline")
                                  ? new Date(form.watch("earlyBirdDeadline")).toLocaleDateString()
                                  : "deadline"}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2">Contact</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{form.watch("contactEmail") || "Email"}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{form.watch("contactPhone") || "Phone"}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => setShowPreview(false)}>
                        Close Preview
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Event Created Successfully!</DialogTitle>
            <DialogDescription>Your event has been created and is now ready to be shared.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button onClick={navigateToEvents} className="sm:flex-1">
              View All Events
            </Button>
            <Button variant="outline" onClick={() => router.push("/Events/new")} className="sm:flex-1">
              Create Another Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

