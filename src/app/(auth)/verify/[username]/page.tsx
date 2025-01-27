"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { verifySchema } from "@/Schema/verifySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import * as z from "zod";
import { ApiResponse } from "@/types/apiResponse";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "src/components/ui/form";
import { Input } from "src/components/ui/input";
import { Button } from "src/components/ui/button";

const VerifyAccount = () => {
  const { username } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`/api/verify-code`, {
        username: username,
        code: data.code,
      });
      toast({
        title: "Account verified",
        description: response.data.message,
      });
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error verifying account", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Error verifying account",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 shadow-md rounded-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          Verify Your Account
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-gray-700 dark:text-gray-300 font-medium">
                    Verification Code
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter 6-digit code"
                      {...field}
                      maxLength={6}
                      className="mt-1 block w-full rounded-md border-green-300 dark:border-green-700 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 dark:focus:ring-green-500 dark:focus:ring-opacity-50"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 mt-1" />
                </FormItem>
              )}
            />
            <div className="text-center text-gray-600 dark:text-gray-400">
              Time remaining: {formatTime(timeLeft)}
            </div>
            <Button
              type="submit"
              className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                form.watch("code").length !== 6 ||
                isSubmitting ||
                timeLeft === 0
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        </Form>
        {timeLeft === 0 && (
          <p className="mt-4 text-center text-red-500">
            Time expired. Please request a new verification code.
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;
