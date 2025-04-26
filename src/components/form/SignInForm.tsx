/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "../../hooks/use-toast";
import {
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SignInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"credentials" | "google">(
    "credentials"
  );

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const isFormValid = form.formState.isValid;

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

        // Add focus to the password field for better UX
        form.setFocus("password");
      } else {
        setFormStatus("success");

        // Show success message briefly before redirecting
        toast({
          title: "Login Successful",
          description: "Redirecting you to your dashboard...",
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800",
        });

        // Delay redirect for a better UX
        setTimeout(() => {
          router.replace("/admin/dashboard");
        }, 1500);
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

  const unsplashImages = [
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600&auto=format&fit=crop",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % unsplashImages.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [unsplashImages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 text-gray-900 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-screen-xl m-0 sm:m-10 bg-white shadow-xl sm:rounded-2xl flex flex-col md:flex-row justify-center overflow-hidden"
      >
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
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
          <div className="text-2xl font-bold mb-4">Sign In</div>
          <p className="text-gray-600 mb-8">
            Welcome back! Please enter your credentials to access your account.
          </p>

          <Tabs defaultValue="credentials" className="w-full">
            <TabsList>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="google" disabled>
                Google
                <span className="ml-2 rounded-full bg-yellow-500 text-white text-[0.6rem] px-1.5 py-0.5">
                  Soon
                </span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="credentials" className="space-y-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
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
                              className={`w-full pl-10 py-2 rounded-lg font-medium bg-gray-50 border ${
                                form.formState.errors.email
                                  ? "border-red-300 focus:border-red-500"
                                  : "border-gray-200 focus:border-green-500"
                              } placeholder-gray-500 text-sm focus:outline-none focus:bg-white transition-all duration-200`}
                              placeholder="mail@example.com"
                              {...field}
                              required
                              aria-invalid={!!form.formState.errors.email}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
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
                              className={`w-full pl-10 py-2 rounded-lg font-medium bg-gray-50 border ${
                                form.formState.errors.password
                                  ? "border-red-300 focus:border-red-500"
                                  : "border-gray-200 focus:border-green-500"
                              } placeholder-gray-500 text-sm focus:outline-none focus:bg-white transition-all duration-200`}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              {...field}
                              required
                              aria-invalid={!!form.formState.errors.password}
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
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />
                  <Button
                    className={`w-full py-2 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center mt-6 h-11 ${
                      formStatus === "success"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                    type="submit"
                    disabled={
                      loading || (!isFormValid && form.formState.isDirty)
                    }
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
          </Tabs>

          <Separator className="my-6" />

          <p className="text-sm text-gray-600 text-center">
            Don&apos;t have an account yet?{" "}
            <Link href="/sign-up" className="text-green-600 hover:underline">
              Sign up
            </Link>
          </p>
          <div className="mt-4 block md:hidden text-center">
            <p className="text-sm text-gray-600 italic">
              Join our community of learners and educators to transform the
              future through knowledge and collaboration.
            </p>
          </div>
        </div>

        <div className="hidden md:block md:w-1/2 xl:w-7/12 bg-green-100 relative overflow-hidden">
          <Image
            src="/auth-image.png"
            alt="Authentication"
            width={300}
            height={300}
            className="absolute w-full h-full object-cover transform scale-105"
          />
          <div className="absolute inset-0 bg-green-600 opacity-20"></div>
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex items-center justify-center"
          >
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
    </div>
  );
}
