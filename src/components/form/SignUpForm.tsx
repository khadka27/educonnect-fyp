"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, type ChangeEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import axios, { type AxiosError } from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "src/components/ui/form";
import { CardDescription, CardHeader, CardTitle } from "src/components/ui/card";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";
import Link from "next/link";
import type { ApiResponse } from "@/types/apiResponse";
import Image from "next/image";
import PasswordStrengthBar from "react-password-strength-bar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";

import studentsImage from "src/Images/premium_photo-1682125773446-259ce64f9dd7.jpeg";
import gradCapImage from "src/Images/grad-cap-diploma-and-stacked-books.jpg";
import thirdImage from "src/Images/premium_photo-1682125773446-259ce64f9dd7.jpeg";
import fourthImage from "src/Images/premium_photo-1682125773446-259ce64f9dd7.jpeg";
import fifthImage from "src/Images/premium_photo-1682125773446-259ce64f9dd7.jpeg";

const FormSchema = z
  .object({
    username: z.string().min(1, "Username is required").max(100),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must have more than 8 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

// Array of educational images
// const educationalImages = [
//   "studentsImage?height=600&width=800&text=Campus+Life",
//   "/placeholder.svg?height=600&width=800&text=Learning+Together",
//   "/placeholder.svg?height=600&width=800&text=Education+Future",
//   "/placeholder.svg?height=600&width=800&text=Student+Success",
//   "/placeholder.svg?height=600&width=800&text=Knowledge+Growth",
// ];

const educationalImages = [
  studentsImage,
  gradCapImage,
  thirdImage,
  fourthImage,
  fifthImage,
];

const SignUpForm = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(educationalImages[0]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  // Select a random educational image on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * educationalImages.length);
    setBackgroundImage(educationalImages[randomIndex]);
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

    if (values.username) completedFields++;
    if (values.email && form.formState.errors.email === undefined)
      completedFields++;
    if (values.password && values.password.length >= 8) completedFields++;
    if (values.confirmPassword && values.password === values.confirmPassword)
      completedFields++;

    setFormProgress(Math.round((completedFields / totalFields) * 100));
  }, [form.watch(), form.formState.errors]);

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get(`/api/check-username-unique`, {
            params: { username },
          });
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError;
          setUsernameMessage(
            (axiosError.response?.data as ApiResponse).message ??
              "Error checking username"
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };

    // Debounce the username check
    const timeoutId = setTimeout(() => {
      if (username.length > 0) {
        checkUsernameUnique();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/sign-up", {
        username: values.username,
        email: values.email,
        password: values.password,
      });

      setFormComplete(true);

      toast({
        title: "Registration Successful!",
        description: "Please check your email for verification.",
      });

      // Delay redirect for better UX
      setTimeout(() => {
        router.push(`/verify/${values.username}`);
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Sign Up Failed",
        description:
          (axiosError.response?.data.message as string) ??
          "There was a problem with your sign-up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    form.formState.isValid &&
    Object.values(form.getValues()).every((value) => value !== "");

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate first step fields
      if (
        form.getValues().username &&
        form.getValues().email &&
        !form.formState.errors.username &&
        !form.formState.errors.email
      ) {
        setCurrentStep(2);
      } else {
        // Trigger validation
        form.trigger(["username", "email"]);
      }
    }
  };

  const prevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 text-gray-900  p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-screen-xl m-0 sm:m-10 bg-white shadow-xl sm:rounded-2xl flex flex-col md:flex-row justify-center overflow-hidden"
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
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${formProgress}%` }}
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
                                    <Info className="h-4 w-4 ml-1 text-gray-400" />
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
                                  className="w-full pl-10 py-2 rounded-lg font-medium bg-gray-50 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-200"
                                  placeholder="Choose a username"
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
                                    usernameMessage === "Username is unique"
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  {usernameMessage === "Username is unique" ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {usernameMessage}
                                </motion.p>
                              )}
                              <FormMessage />
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
                                  className="w-full pl-10 py-2 rounded-lg font-medium bg-gray-50 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-200"
                                  placeholder="your.email@example.com"
                                />
                              </div>
                            </FormControl>
                            <p className="text-muted text-gray-500 text-xs flex items-center mt-1">
                              <Info className="h-3 w-3 mr-1" />
                              We'll send you a verification code
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="pt-4">
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center h-11"
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
                                  className="w-full pl-10 py-2 rounded-lg font-medium bg-gray-50 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-200 pr-10"
                                  placeholder="Create a strong password"
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
                              <PasswordStrengthBar password={field.value} />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Use at least 8 characters with a mix of letters,
                              numbers & symbols
                            </p>
                            <FormMessage />
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
                                  className="w-full pl-10 py-2 rounded-lg font-medium bg-gray-50 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-200 pr-10"
                                  placeholder="Re-enter your password"
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="sm:flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="sm:flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center"
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
              <Link href="/terms" className="text-green-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-green-600 hover:underline">
                Privacy Policy
              </Link>
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
            <Image
              src={backgroundImage || "/placeholder.svg"}
              alt="Educational Image"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/70 to-transparent flex flex-col items-center justify-end p-10 text-white">
              <h2 className="text-2xl font-bold mb-2">
                Start Your Learning Journey
              </h2>
              <p className="text-center max-w-md text-white/90">
                Join thousands of students and educators on our platform to
                discover new opportunities and expand your knowledge.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpForm;
