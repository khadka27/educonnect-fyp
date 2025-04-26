/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, type ChangeEvent, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import PasswordStrengthBar from "react-password-strength-bar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Info,
  ArrowLeft,
} from "lucide-react";

const FormSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores and hyphens"
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

// Unsplash education-related images
const unsplashImages = [
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?q=80&w=1600&auto=format&fit=crop",
];

export default function SignUpForm() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  // Select a random educational image on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * unsplashImages.length);
    setCurrentImageIndex(randomIndex);

    // Set up image rotation
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % unsplashImages.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Calculate form completion progress
  useEffect(() => {
    const values = form.getValues();
    let completedFields = 0;
    const totalFields = 4; // username, email, password, confirmPassword

    if (values.username && !form.formState.errors.username) completedFields++;
    if (values.email && !form.formState.errors.email) completedFields++;
    if (values.password && !form.formState.errors.password) completedFields++;
    if (values.confirmPassword && !form.formState.errors.confirmPassword)
      completedFields++;

    setFormProgress(Math.round((completedFields / totalFields) * 100));
  }, [form.watch(), form.formState.errors]);

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username && username.length >= 3) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await fetch(
            `/api/check-username-unique?username=${username}`
          );
          const data = await response.json();

          if (response.ok && data.success) {
            setUsernameMessage("Username is available");
          } else {
            setUsernameMessage(data.message || "Username is already taken");
          }
        } catch (error) {
          setUsernameMessage("Error checking username");
        } finally {
          setIsCheckingUsername(false);
        }
      } else if (username) {
        setUsernameMessage("Username must be at least 3 characters");
      }
    };

    // Debounce the username check
    const timeoutId = setTimeout(() => {
      if (username.length > 0) {
        checkUsernameUnique();
      } else {
        setUsernameMessage("");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
      // Make a real API call to the sign-up endpoint
      const response = await fetch("/api/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong during registration"
        );
      }

      setFormComplete(true);

      toast({
        title: "Registration Successful!",
        description: "Please check your email for verification.",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Delay redirect for better UX
      setTimeout(() => {
        router.push(`/verify/${values.username}`);
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);

      toast({
        title: "Sign Up Failed",
        description:
          error instanceof Error
            ? error.message
            : "There was a problem with your sign-up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = form.formState.isValid;

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate first step fields
      form.trigger(["username", "email"]).then((isValid) => {
        if (isValid && usernameMessage !== "Username is already taken") {
          setCurrentStep(2);
        }
      });
    }
  };

  const prevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const openTerms = () => setIsTermsOpen(true);
  const closeTerms = () => setIsTermsOpen(false);

  const openPrivacy = () => setIsPrivacyOpen(true);
  const closePrivacy = () => setIsPrivacyOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 text-gray-900 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-screen-xl m-0 sm:m-10 bg-white shadow-xl sm:rounded-2xl flex flex-col md:flex-row justify-center overflow-hidden"
      >
        <div className="w-full md:w-1/2 xl:w-5/12 p-6 sm:p-10">
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center mb-6"
            >
              <Image
                src="/eduConnect.png"
                alt="EduConnect Logo"
                width={180}
                height={180}
                className="mr-4"
              />
            </motion.div>

            <CardHeader className="space-y-1 p-0 text-center mb-4">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Create an Account
              </CardTitle>
              <CardDescription>
                Join our educational community today
              </CardDescription>
            </CardHeader>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full mb-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${formProgress}%` }}
                className="h-full bg-green-500 rounded-full"
                transition={{ duration: 0.5 }}
              />
            </div>

            <Form {...form}>
              <form
                ref={formRef}
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-4"
              >
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <FormField
                        name="username"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 flex items-center">
                              Username
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 ml-1 text-gray-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="w-[200px] text-xs">
                                      Choose a unique username that will
                                      identify you on the platform
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                                <Input
                                  {...field}
                                  onChange={(
                                    e: ChangeEvent<HTMLInputElement>
                                  ) => {
                                    field.onChange(e);
                                    setUsername(e.target.value);
                                  }}
                                  className={`w-full pl-10 py-2 rounded-lg font-medium bg-gray-50 border ${
                                    form.formState.errors.username
                                      ? "border-red-300 focus:border-red-500"
                                      : "border-gray-200 focus:border-green-500"
                                  } placeholder-gray-500 text-sm focus:outline-none focus:bg-white transition-all duration-200`}
                                  placeholder="Choose a username"
                                  aria-invalid={
                                    !!form.formState.errors.username
                                  }
                                />
                              </div>
                            </FormControl>
                            <div className="h-6 mt-1">
                              {isCheckingUsername && (
                                <div className="flex items-center text-gray-500 text-sm">
                                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                  Checking availability...
                                </div>
                              )}
                              {!isCheckingUsername && usernameMessage && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className={`text-sm flex items-center ${
                                    usernameMessage === "Username is available"
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  {usernameMessage ===
                                  "Username is available" ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {usernameMessage}
                                </motion.p>
                              )}
                              {form.formState.errors.username && (
                                <FormMessage className="text-red-500 text-xs" />
                              )}
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              Email
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                                <Input
                                  {...field}
                                  className={`w-full pl-10 py-2 rounded-lg font-medium bg-gray-50 border ${
                                    form.formState.errors.email
                                      ? "border-red-300 focus:border-red-500"
                                      : "border-gray-200 focus:border-green-500"
                                  } placeholder-gray-500 text-sm focus:outline-none focus:bg-white transition-all duration-200`}
                                  placeholder="your.email@example.com"
                                  aria-invalid={!!form.formState.errors.email}
                                />
                              </div>
                            </FormControl>
                            <p className="text-muted text-gray-500 text-xs flex items-center mt-1">
                              <Info className="h-3 w-3 mr-1" />
                              We&apos;ll send you a verification code
                            </p>
                            {form.formState.errors.email && (
                              <FormMessage className="text-red-500 text-xs" />
                            )}
                          </FormItem>
                        )}
                      />
                      <div className="pt-4">
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center h-11"
                          disabled={
                            !!form.formState.errors.username ||
                            !!form.formState.errors.email ||
                            !form.getValues().username ||
                            !form.getValues().email ||
                            usernameMessage === "Username is already taken"
                          }
                        >
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <FormField
                        name="password"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  className={`w-full pl-10 py-2 rounded-lg font-medium bg-gray-50 border ${
                                    form.formState.errors.password
                                      ? "border-red-300 focus:border-red-500"
                                      : "border-gray-200 focus:border-green-500"
                                  } placeholder-gray-500 text-sm focus:outline-none focus:bg-white transition-all duration-200 pr-10`}
                                  placeholder="Create a strong password"
                                  aria-invalid={
                                    !!form.formState.errors.password
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <div className="mt-2">
                              <PasswordStrengthBar
                                password={field.value}
                                scoreWords={[
                                  "Weak",
                                  "Weak",
                                  "Fair",
                                  "Good",
                                  "Strong",
                                ]}
                                className="password-strength-bar"
                                minLength={8}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Use at least 8 characters with uppercase,
                              lowercase, and numbers
                            </p>
                            {form.formState.errors.password && (
                              <FormMessage className="text-red-500 text-xs" />
                            )}
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="confirmPassword"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                                <Input
                                  {...field}
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  className={`w-full pl-10 py-2 rounded-lg font-medium bg-gray-50 border ${
                                    form.formState.errors.confirmPassword
                                      ? "border-red-300 focus:border-red-500"
                                      : "border-gray-200 focus:border-green-500"
                                  } placeholder-gray-500 text-sm focus:outline-none focus:bg-white transition-all duration-200 pr-10`}
                                  placeholder="Re-enter your password"
                                  aria-invalid={
                                    !!form.formState.errors.confirmPassword
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            {form.formState.errors.confirmPassword && (
                              <FormMessage className="text-red-500 text-xs" />
                            )}
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="sm:flex-1 flex items-center justify-center"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className={`sm:flex-1 py-2 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center ${
                            formComplete
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                          disabled={isSubmitting || !isFormValid}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : formComplete ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Account created!
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </Form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-green-600 hover:text-green-800 font-medium hover:underline transition-all duration-200"
                >
                  Sign In
                </Link>
              </p>
            </div>

            <div className="mt-6 text-xs text-gray-500 text-center">
              By creating an account, you agree to our{" "}
              <button
                onClick={openTerms}
                className="text-green-600 hover:underline"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                onClick={openPrivacy}
                className="text-green-600 hover:underline"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:block md:w-1/2 bg-green-100 relative overflow-hidden">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Educational Image with Unsplash */}
            <div className="relative w-full h-full">
              <motion.img
                key={currentImageIndex}
                src={unsplashImages[currentImageIndex]}
                alt={`Educational Image ${currentImageIndex + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              />

              {/* Image navigation indicators */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {unsplashImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentImageIndex === index
                        ? "bg-white w-4"
                        : "bg-white/50"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-green-900/70 to-transparent flex flex-col items-center justify-end p-10 text-white">
                <h2 className="text-2xl font-bold mb-2">
                  Start Your Learning Journey
                </h2>
                <p className="text-center max-w-md text-white/90">
                  Join thousands of students and educators on our platform to
                  discover new opportunities and expand your knowledge.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Terms of Service Dialog */}
      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>
              <p>
                Welcome to EduConnect! By using our platform, you agree to
                comply with our terms and conditions. Please ensure you use the
                platform responsibly and respect other users.
              </p>
              <p>
                For more details, contact our support team or visit our website.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>
              <p>
                At EduConnect, we value your privacy. Your personal information
                is securely stored and will not be shared without your consent.
              </p>
              <p>
                For more information, please review our detailed privacy policy
                on our website.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
