"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

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

const SignInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export default function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof SignInSchema>) => {
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    setLoading(false);

    if (result?.error) {
      toast({
        title: "Login Failed",
        description:
          result.error === "CredentialsSignin"
            ? "Incorrect email or password"
            : result.error,
        variant: "destructive",
      });
      return;
    }

    if (result?.url) {
      router.replace("/admin/dashboard" || "/Home");
    }
  };

  const isFormValid = form.formState.isValid;

  return (
    <div className="min-h-screen bg-green-50 text-gray-900 flex justify-center items-center">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow-lg sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div className="flex items-center justify-center mb-6">
            <Image
              src="/eduConnect.png"
              alt="Logo"
              width={200}
              height={200}
              className="mr-4"
            />
          </div>
          <div className="mt-12 flex flex-col items-center">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full px-4 py-2 rounded-lg font-medium bg-green-50 border border-green-200 placeholder-gray-500 text-sm focus:outline-none focus:border-green-400 focus:bg-white"
                          placeholder="mail@example.com"
                          {...field}
                          required
                        />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            className="w-full px-4 py-2 rounded-lg font-medium bg-green-50 border border-green-200 placeholder-gray-500 text-sm focus:outline-none focus:border-green-400 focus:bg-white"
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
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all duration-300 ease-in-out flex items-center justify-center"
                  type="submit"
                  disabled={loading || !isFormValid}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
            <div className="mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400">
              or
            </div>
            <GoogleSignInButton>Sign in with Google</GoogleSignInButton>
            <p className="text-center text-sm text-gray-600 mt-4">
              If you don&apos;t have an account, please&nbsp;
              <Link className="text-green-500 hover:underline" href="/sign-up">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        <div className="flex-1 bg-green-100 text-center hidden lg:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://drive.google.com/uc?export=view&id=1KZ_Ub_2lZ0dHbKV0fAIhxVhiQA183RCz')",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
