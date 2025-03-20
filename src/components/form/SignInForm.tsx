"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "src/components/ui/form";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";
import { useToast } from "src/hooks/use-toast";
import GoogleSignInButton from "src/components/ui/GoogleSignInButton";
import { CardDescription, CardHeader, CardTitle } from "src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";

import studentsImage from "src/Images/premium_photo-1682125773446-259ce64f9dd7.jpeg";
import gradCapImage from "src/Images/grad-cap-diploma-and-stacked-books.jpg";
import thirdImage from "src/Images/premium_photo-1682125773446-259ce64f9dd7.jpeg";
import fourthImage from "src/Images/premium_photo-1682125773446-259ce64f9dd7.jpeg";
import fifthImage from "src/Images/premium_photo-1682125773446-259ce64f9dd7.jpeg";

const SignInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

// Array of educational images with proper Next.js 15 paths
const educationalImages = [
  studentsImage,
  gradCapImage,
  thirdImage,
  fourthImage,
  fifthImage,
];

// Fallback images in case the real ones aren't available
const fallbackImages = [
  "/api/placeholder/800/600?text=Students+Learning",
  "/api/placeholder/800/600?text=Campus+Life",
  "/api/placeholder/800/600?text=Graduation+Day",
  "/api/placeholder/800/600?text=Library+Study",
  "/api/placeholder/800/600?text=Science+Lab",
];

export default function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"credentials" | "google">(
    "credentials"
  );
  const { toast } = useToast();

  // Function to get the current image source
  const getCurrentImage = () => {
    return imageError
      ? fallbackImages[currentImageIndex]
      : educationalImages[currentImageIndex];
  };

  // Rotate through images at a fixed interval
  useEffect(() => {
    // Start with a random image
    setCurrentImageIndex(Math.floor(Math.random() * educationalImages.length));

    // Set up interval to rotate images
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % educationalImages.length
      );
      // Reset error state when changing images
      setImageError(false);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof SignInSchema>) => {
    setLoading(true);
    setFormStatus("idle");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setFormStatus("error");
        toast({
          title: "Login Failed",
          description:
            result.error === "CredentialsSignin"
              ? "Incorrect email or password"
              : result.error,
          variant: "destructive",
        });
      } else {
        setFormStatus("success");

        // Show success message briefly before redirecting
        toast({
          title: "Login Successful",
          description: "Redirecting you to your dashboard...",
          variant: "default",
        });

        // Delay redirect for a better UX
        setTimeout(() => {
          if (result?.url) {
            router.replace("/admin/dashboard" || "/Home");
          }
        }, 1000);
      }
    } catch (error) {
      setFormStatus("error");
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/admin/dashboard" || "/Home" });
    } catch (error) {
      toast({
        title: "Google Sign-In Failed",
        description:
          "An error occurred during Google sign-in. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const isFormValid = form.formState.isValid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 text-gray-900 p-4">
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
              className="flex items-center justify-center mb-8"
            >
              <Image
                src="/eduConnect.png"
                alt="EduConnect Logo"
                width={180}
                height={180}
                className="mr-4"
              />
            </motion.div>

            <CardHeader className="space-y-1 p-0 text-center mb-6">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Welcome back!
              </CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>

            <Tabs
              defaultValue="credentials"
              className="w-full"
              value={activeTab || "credentials"}
              onVolumeChange={(value) =>
                setActiveTab(value as "credentials" | "google")
              }
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="credentials">Email</TabsTrigger>
                <TabsTrigger value="google">Google</TabsTrigger>
              </TabsList>

              <TabsContent value="credentials" className="space-y-4">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                              <Input
                                className="w-full pl-10 py-2 rounded-lg font-medium bg-gray-50 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-200"
                                placeholder="mail@example.com"
                                {...field}
                                required
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel className="text-gray-700">
                              Password
                            </FormLabel>
                            <Link
                              href="/forgot-password"
                              className="text-xs text-green-600 hover:text-green-800 hover:underline"
                            >
                              Forgot password?
                            </Link>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                              <Input
                                className="w-full pl-10 py-2 rounded-lg font-medium bg-gray-50 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-200"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                {...field}
                                required
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center mt-6 h-11"
                      type="submit"
                      disabled={loading || !isFormValid}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : formStatus === "success" ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Success!
                        </>
                      ) : (
                        <>
                          Sign in
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="google" className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    Sign in with your Google account for a seamless experience
                  </p>
                </div>
                <div onClick={handleGoogleSignIn} className="cursor-pointer">
                  <GoogleSignInButton>Sign in with Google</GoogleSignInButton>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account yet?{" "}
                <Link
                  className="text-green-600 hover:text-green-800 font-medium hover:underline transition-all duration-200"
                  href="/sign-up"
                >
                  Sign up
                </Link>
              </p>
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
            {/* Educational Image with fallback mechanism */}
            <div className="relative w-full h-full">
              <Image
                src={getCurrentImage()}
                alt={`Educational Image - ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                priority
                onError={() => setImageError(true)}
              />

              {/* Image navigation indicators */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {educationalImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setImageError(false);
                    }}
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
                  Empowering Education
                </h2>
                <p className="text-center max-w-md text-white/90">
                  Join our community of learners and educators to transform the
                  future through knowledge and collaboration.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
