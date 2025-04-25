"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Info,
} from "lucide-react";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";
import { Badge } from "src/components/ui/badge";
import { Separator } from "src/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface RegistrationFormProps {
  event: {
    id: string;
    title: string;
    type: string;
    price?: string;
    date?: string;
    location?: string;
    startTime?: string;
    bannerUrl?: string;
  };
  onSuccess: () => void;
  onClose: () => void;
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RegistrationForm({
  event,
  onSuccess,
  onClose,
  submitting,
  setSubmitting,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [currentStep, setCurrentStep] = useState(1);
  const [formProgress, setFormProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  // Calculate form completion progress
  useEffect(() => {
    const totalFields = event.type.toLowerCase() === "premium" ? 4 : 3;
    let completedFields = 0;

    if (formData.name.trim()) completedFields++;
    if (formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) completedFields++;
    if (formData.phone.match(/^\d{10,15}$/)) completedFields++;
    if (event.type.toLowerCase() === "premium" && paymentMethod)
      completedFields++;

    setFormProgress(Math.round((completedFields / totalFields) * 100));
  }, [formData, paymentMethod, event.type]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate current step
  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        errors.name = "Name is required";
      }

      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.email = "Please provide a valid email address";
      }

      if (!formData.phone.match(/^\d{10,15}$/)) {
        errors.phone = "Phone number must be between 10 and 15 digits";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Move to next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Move to previous step
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Validate form inputs
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name is required.",
      });
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please provide a valid email address.",
      });
      return false;
    }
    if (!formData.phone.match(/^\d{10,15}$/)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Phone number must be between 10 and 15 digits.",
      });
      return false;
    }
    if (event.type.toLowerCase() === "premium" && !paymentMethod) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a payment method.",
      });
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      if (event.type.toLowerCase() === "premium") {
        // First, save the registration record with paymentStatus = PENDING
        await registerForPaidEvent();
        // Then, initiate payment for premium events
        await initiatePayment(paymentMethod, event.price || "0", event.id);
      } else {
        // For free events, register the user directly
        await registerForEvent();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show confirmation before submitting
  const showConfirmationDialog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  // Initiate payment for eSewa or Khalti
  const initiatePayment = async (
    method: string,
    amount: string,
    eventId: string
  ) => {
    try {
      const response = await fetch(`/api/initiate-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          amount,
          productName: event.title,
          transactionId: `txn_${Date.now()}_${eventId}`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || `${method.toUpperCase()} payment initiation failed.`
        );
      }

      // Redirect to the respective payment gateway
      window.location.href =
        method === "esewa" ? data.esewaPaymentUrl : data.khaltiPaymentUrl;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  };

  // Register directly for free events
  const registerForEvent = async () => {
    const response = await fetch("/api/events/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: event.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed.");
    }

    toast({
      title: "Success",
      description: "You have successfully registered for the event.",
    });
    onSuccess();
  };

  //register for paid event
  const registerForPaidEvent = async () => {
    const response = await fetch("/api/events/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: event.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        // For premium events, paymentMethod is included
        paymentMethod:
          event.type.toLowerCase() === "premium" ? paymentMethod : "pending",
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed.");
    }
    // Optionally, process the returned registration data if needed.
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Progress bar */}
          <div className="w-full bg-muted h-1">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${formProgress}%` }}
            />
          </div>

          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl font-bold">
              Register for Event
            </DialogTitle>
            <DialogDescription>
              Complete the form below to register for{" "}
              <span className="font-medium text-primary">{event.title}</span>
            </DialogDescription>
          </DialogHeader>

          <Tabs value={`step-${currentStep}`} className="flex-1">
            <div className="px-6">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger
                  value="step-1"
                  disabled={currentStep !== 1}
                  className={cn(
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                    currentStep > 1 && "text-muted-foreground"
                  )}
                >
                  Personal Info
                </TabsTrigger>
                <TabsTrigger
                  value="step-2"
                  disabled={currentStep !== 2}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {event.type.toLowerCase() === "premium"
                    ? "Payment"
                    : "Confirmation"}
                </TabsTrigger>
              </TabsList>
            </div>

            <form onSubmit={showConfirmationDialog}>
              <TabsContent value="step-1" className="m-0 p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-base">
                      Full Name
                    </Label>
                    <div className="relative mt-1.5">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                        <User className="h-5 w-5" />
                      </div>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={cn(
                          "pl-10 transition-all duration-200",
                          validationErrors.name
                            ? "border-destructive focus:ring-destructive/50"
                            : "focus:ring-2 focus:ring-primary/20"
                        )}
                        required
                      />
                    </div>
                    {validationErrors.name && (
                      <p className="text-sm text-destructive mt-1 flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-base">
                      Email Address
                    </Label>
                    <div className="relative mt-1.5">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className={cn(
                          "pl-10 transition-all duration-200",
                          validationErrors.email
                            ? "border-destructive focus:ring-destructive/50"
                            : "focus:ring-2 focus:ring-primary/20"
                        )}
                        required
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-sm text-destructive mt-1 flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        {validationErrors.email}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll send the event details and updates to this email
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-base">
                      Phone Number
                    </Label>
                    <div className="relative mt-1.5">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                        <Phone className="h-5 w-5" />
                      </div>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className={cn(
                          "pl-10 transition-all duration-200",
                          validationErrors.phone
                            ? "border-destructive focus:ring-destructive/50"
                            : "focus:ring-2 focus:ring-primary/20"
                        )}
                        required
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="text-sm text-destructive mt-1 flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <Card className="bg-muted/50 border-muted">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Event Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    {event.startTime && (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{event.startTime}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {event.type.toLowerCase() === "premium"
                          ? `${event.price || "0"} (Premium Event)`
                          : "Free Event"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="pt-4">
                  <Button type="button" onClick={nextStep} className="w-full">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="step-2" className="m-0 p-6 space-y-4">
                {event.type.toLowerCase() === "premium" ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base">Select Payment Method</Label>
                      <div className="mt-3">
                        <RadioGroup
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="esewa" id="esewa" />
                            <Label
                              htmlFor="esewa"
                              className="flex items-center cursor-pointer"
                            >
                              <div className="w-12 h-12 bg-[#60BB46] rounded-md flex items-center justify-center mr-3">
                                <span className="text-white font-bold">
                                  eSewa
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">eSewa</div>
                                <div className="text-sm text-muted-foreground">
                                  Pay using your eSewa account
                                </div>
                              </div>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="khalti" id="khalti" />
                            <Label
                              htmlFor="khalti"
                              className="flex items-center cursor-pointer"
                            >
                              <div className="w-12 h-12 bg-[#5C2D91] rounded-md flex items-center justify-center mr-3">
                                <span className="text-white font-bold">
                                  Khalti
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">Khalti</div>
                                <div className="text-sm text-muted-foreground">
                                  Pay using your Khalti account
                                </div>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Event Price
                        </span>
                        <span>{event.price || "0"}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>{event.price || "0"}</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 rounded-lg p-4 text-sm">
                      <p className="flex items-start">
                        <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          You'll be redirected to the payment gateway after
                          clicking "Complete Registration". Once payment is
                          successful, your registration will be confirmed.
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-950/50 rounded-lg p-4 text-green-800 dark:text-green-300">
                      <h3 className="font-medium flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Ready to Complete Registration
                      </h3>
                      <p className="mt-2 text-sm">
                        Please review your information before completing the
                        registration.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{formData.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Event</span>
                        <span className="font-medium">{event.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline">Free Event</Badge>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="sm:flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="sm:flex-1">
                    Complete Registration
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Tabs>
        </div>
      </DialogContent>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Registration</DialogTitle>
            <DialogDescription>
              Please confirm that you want to register for this event.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Registration Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Name:</div>
                <div>{formData.name}</div>
                <div className="text-muted-foreground">Email:</div>
                <div>{formData.email}</div>
                <div className="text-muted-foreground">Phone:</div>
                <div>{formData.phone}</div>
                {event.type.toLowerCase() === "premium" && (
                  <>
                    <div className="text-muted-foreground">Payment Method:</div>
                    <div className="capitalize">{paymentMethod}</div>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-md bg-muted p-4">
              <div className="font-medium">{event.title}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {event.date && formatDate(event.date)}
                {event.location && ` • ${event.location}`}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              className="sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                setShowConfirmation(false);
                handleSubmit(e as any);
              }}
              disabled={submitting}
              className="sm:flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Registration"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
